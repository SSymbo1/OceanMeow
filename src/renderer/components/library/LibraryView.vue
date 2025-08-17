<script lang="ts" setup>
  import { AppstoreOutlined, MenuOutlined } from '@ant-design/icons-vue';
  import { onMounted, Ref, ref, watch, computed, onActivated, nextTick } from 'vue';
  import { LibraryDetail } from '@/type/electron/entity';
  import { useAccountStore } from '@/renderer/pinia/store/account';
  import { useSteamStore } from '@/renderer/pinia/store/steam';
  import { useConfigStore } from '@/renderer/pinia/store/config';
  import {
    FieldTimeOutlined,
    TagOutlined,
    KeyOutlined,
    SettingOutlined,
    DeleteOutlined,
  } from '@ant-design/icons-vue';
  import emptyIcon from '@/renderer/assets/icon/empty.svg';
  import router from '@/renderer/router/main';
  import { useRoute } from 'vue-router';
  import { MenuClickEventHandler } from 'ant-design-vue/es/menu/src/interface';

  const localRadio = ref('grid');
  const prevView = ref(localRadio.value);
  const transitionDirection = ref('');
  const librarysLoading = ref(false);
  const keyword: Ref<string> = ref('');
  const librarys: Ref<LibraryDetail[]> = ref([]);
  const skeletonData = Array.from({ length: 3 }, () => ({}));
  const scrollArea = ref();
  const route = useRoute();
  const viewKey = computed(() => {
    if (librarys.value.length === 0) return 'empty';
    return localRadio.value;
  });

  const searchAccountLibrary = async (keywords?: string) => {
    librarysLoading.value = true;
    librarys.value = await window.electronAPI.queryLibraryDetail(
      useAccountStore().account.steam_id,
      keywords
    );
    setTimeout(() => {
      librarysLoading.value = false;
    }, 1000);
  };

  const handleGridMenuClick: MenuClickEventHandler = (e) => {
    console.log(e);
  };

  const routeToGameDetail = (lib: LibraryDetail) => {
    router.push({
      name: 'Game',
      params: { appID: lib.appId },
      query: {
        cover: JSON.stringify({
          hero: lib.appHero,
          logo: lib.appLogo,
          name: lib.appName,
          time: lib.timeHour,
        }),
      },
    });
  };

  watch(localRadio, (newVal, oldVal) => {
    if (oldVal === 'grid' && newVal === 'list') {
      transitionDirection.value = 'left';
    } else if (oldVal === 'list' && newVal === 'grid') {
      transitionDirection.value = 'right';
    }
    prevView.value = oldVal;
  });

  watch(
    () => useAccountStore().account.steam_id,
    async (newVal, oldVal) => {
      if (newVal !== oldVal) {
        await searchAccountLibrary();
      }
    }
  );

  watch(
    () => ({
      librarySort: useConfigStore().config.librarySort,
      librarySortOrder: useConfigStore().config.librarySortOrder,
    }),
    async () => {
      await searchAccountLibrary();
    },
    { deep: true }
  );

  onMounted(async () => {
    await searchAccountLibrary();
  });
  onActivated(async () => {
    await nextTick();
    const appId = route.query.scrollTo;
    if (appId) {
      const el = document.querySelector(`[data-app-id="${appId}"]`);
      el?.scrollIntoView({ block: 'center' });
      router.replace({ query: { ...route.query, scrollTo: undefined } });
    }
  });
</script>

<template>
  <a-layout class="h-full w-full overflow-hidden">
    <a-layout-content class="flex flex-col h-full">
      <div class="h-15 px-3 py-1 flex flex-row justify-between items-center">
        <a-input-search
          v-model:value="keyword"
          allow-clear
          placeholder="搜索"
          enter-button
          size="middle"
          style="width: calc(var(--spacing) * 70)"
          @search="searchAccountLibrary(keyword)"
        />
        <a-radio-group v-model:value="localRadio" class="flex-shrink-0">
          <a-radio-button value="grid">
            <AppstoreOutlined />
          </a-radio-button>
          <a-radio-button value="list">
            <MenuOutlined />
          </a-radio-button>
        </a-radio-group>
      </div>
      <div ref="scrollArea" class="flex-1 overflow-y-auto overflow-x-hidden">
        <transition :name="transitionDirection ? 'slide-' + transitionDirection : ''" mode="out-in">
          <div :key="viewKey" class="h-full">
            <div
              v-if="localRadio === 'grid' && librarys.length !== 0"
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-3 py-3"
            >
              <template v-if="librarysLoading">
                <div
                  v-for="i in 8"
                  :key="i"
                  class="w-full h-55 rounded-lg bg-gray-200 animate-pulse"
                ></div>
              </template>
              <template v-else>
                <div
                  v-for="(lib, index) in librarys"
                  :key="index"
                  :data-app-id="lib.appId"
                  class="relative w-full h-55 group"
                >
                  <div
                    class="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur-md group-hover:opacity-100 transition-all duration-500"
                  ></div>
                  <a-dropdown :trigger="['contextmenu']">
                    <a-card
                      hoverable
                      class="relative w-full h-full !p-0 overflow-hidden rounded-lg border border-transparent transition-all duration-300 group-hover:border-blue-500"
                      @click="routeToGameDetail(lib)"
                    >
                      <div class="absolute inset-0">
                        <img
                          :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${lib.appPicture}`"
                          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          alt="游戏封面图"
                        />
                      </div>
                      <div
                        v-if="useConfigStore().config.libraryCoverInfo === '0'"
                        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 max-w-100 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs text-center rounded-t-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                      >
                        {{ lib.screenCount }}张
                      </div>
                      <div
                        v-if="useConfigStore().config.libraryCoverInfo === '1'"
                        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 max-w-100 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs text-center rounded-t-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                      >
                        {{ lib.timeHour }}h
                      </div>
                      <div
                        v-if="useConfigStore().config.libraryCoverInfo === '2'"
                        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 max-w-100 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs text-center rounded-t-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
                      >
                        {{ lib.lastPlay ? lib.lastPlay : '未游玩' }}
                      </div>
                    </a-card>
                    <template #overlay>
                      <a-menu @click="handleGridMenuClick">
                        <a-menu-item key="1" disabled>{{ lib.appName }}</a-menu-item>
                        <a-menu-divider />
                        <a-menu-item key="2">
                          <span class="inline-flex items-center">
                            <SettingOutlined />
                            <span class="ml-2">编辑信息</span>
                          </span>
                        </a-menu-item>
                        <a-menu-item key="3">
                          <span class="inline-flex items-center text-red-400">
                            <DeleteOutlined />
                            <span class="ml-2">移除</span>
                          </span>
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </template>
            </div>
            <div v-if="localRadio === 'list' && librarys.length !== 0">
              <a-list
                item-layout="vertical"
                size="large"
                :data-source="librarysLoading ? skeletonData : librarys"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <div class="flex w-full">
                      <template v-if="librarysLoading">
                        <a-skeleton-image class="rounded flex-shrink-0" />
                      </template>
                      <template v-else>
                        <img
                          width="120"
                          alt="logo"
                          class="object-cover rounded flex-shrink-0"
                          :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${item.appPicture}`"
                        />
                      </template>
                      <div class="flex-1 flex flex-col ml-4">
                        <div class="text-lg font-semibold mb-1">
                          <a-skeleton
                            v-if="librarysLoading"
                            :title="false"
                            :paragraph="{ rows: 1, width: 120 }"
                            active
                          />
                          <template v-else>
                            {{ item.appName }}
                          </template>
                        </div>
                        <div class="text-sm text-gray-600 leading-tight">
                          <a-skeleton
                            v-if="librarysLoading"
                            :title="false"
                            :paragraph="{ rows: 1, width: 200 }"
                            active
                          />
                          <template v-else>
                            {{ item.appLocalized }}
                          </template>
                        </div>
                        <div class="flex justify-end items-end flex-1">
                          <a-skeleton
                            v-if="librarysLoading"
                            :title="false"
                            :paragraph="{ rows: 1, width: 100 }"
                            active
                          />
                          <div v-else class="flex space-x-4 text-sm text-gray-500">
                            <span class="flex items-center">
                              <component :is="KeyOutlined" class="mr-1" />
                              {{ item.appId }}
                            </span>
                            <span class="flex items-center">
                              <component :is="TagOutlined" class="mr-1" />
                              {{ item.type }}
                            </span>
                            <span class="flex items-center">
                              <component :is="FieldTimeOutlined" class="mr-1" />
                              {{ `${item.timeHour}h` }}
                            </span>
                            <span class="flex items-center">
                              <component :is="FieldTimeOutlined" class="mr-1" />
                              {{ item.lastPlay === null ? '无记录' : item.lastPlay }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a-list-item>
                </template>
              </a-list>
            </div>
            <div
              v-if="librarys.length === 0 && (localRadio === 'list' || localRadio === 'grid')"
              class="overflow-y-hidden"
            >
              <a-empty
                :image="emptyIcon"
                :image-style="{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }"
                class="mt-20"
              >
                <template #description>
                  <div v-if="keyword === ''">未检索到库存</div>
                  <div v-else>{{ `没有从您的库中找到 “${keyword}” ` }}</div>
                  <div class="mt-1">
                    受限于从本地库中检索，您可能需要重新启动Steam客户端以获取最新库存信息。
                  </div>
                </template>
              </a-empty>
            </div>
          </div>
        </transition>
      </div>
      <a-back-top :target="() => scrollArea" />
    </a-layout-content>
  </a-layout>
</template>

<style scoped>
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: all 0.2s cubic-bezier(0.55, 0, 0.1, 1);
  }

  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(50px);
  }

  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(-50px);
  }

  .slide-right-enter-from {
    opacity: 0;
    transform: translateX(-50px);
  }

  .slide-right-leave-to {
    opacity: 0;
    transform: translateX(50px);
  }
</style>
