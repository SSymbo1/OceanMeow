<script lang="ts" setup>
  import { App } from 'ant-design-vue';
  import { useSteamStore } from '@/renderer/pinia/store/steam';
  import { ScreenDetail } from '@/type/electron/entity';
  import { onActivated, onDeactivated, ref, Ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAccountStore } from '@/renderer/pinia/store/account';
  import { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
  import { useConfigStore } from '@/renderer/pinia/store/config';
  import back from '@/renderer/assets/icon/back.svg';
  import router from '@/renderer/router/main';
  import ScreenBackupOptionModal from '../component/modal/ScreenBackupOptionModal.vue';
  import ScreenshotDetailModal from '../component/modal/ScreenshotDetailModal.vue';
  import QrCodeShareModal from '../component/modal/QrCodeShareModal.vue';

  interface Cover {
    hero: string;
    logo: string;
    name: string;
    time: string;
  }
  let defaultWheelDistance = 0;
  const wheelEventTrigger = 120;
  const { message } = App.useApp();
  const cover: Ref<Cover> = ref({ hero: '', logo: '', name: '', time: '' });
  const appID = ref('');
  const keyword: Ref<string> = ref('');
  const screenshots: Ref<ScreenDetail[]> = ref([]);
  const totalScreen = ref(0);
  const screenschortsLoading = ref(false);
  const firstTotalQuery = ref(true);
  const selectedKeys = ref<string[]>(['0']);
  const screenCheckList: Ref<number[]> = ref([]);
  const scrollArea = ref<HTMLElement | null>(null);
  const detail: Ref<any> = ref(null);
  const option: Ref<any> = ref(null);
  const share: Ref<any> = ref(null);
  const topButtonShow = ref(false);
  const reviewerVisiable = ref(false);
  const reviwerImage = ref('');
  const darkMode = ref(true);
  const route = useRoute();

  const appDetailSearch = async (model: string, keywords?: string) => {
    if (model === 'screenshot') {
      screenschortsLoading.value = true;
      screenshots.value = await window.electronAPI.queryScreenshotDetail(
        useAccountStore().account.steam_id,
        appID.value,
        keywords
      );
      if (firstTotalQuery.value) {
        totalScreen.value = screenshots.value.length;
        firstTotalQuery.value = false;
      }
      setTimeout(() => {
        screenschortsLoading.value = false;
      }, 1000);
    } else {
      console.log(model);
    }
  };

  const showImageReviewer = (image: string) => {
    reviwerImage.value = image;
    reviewerVisiable.value = !reviewerVisiable.value;
  };

  const goBack = () => {
    router.push({
      name: 'Library',
      query: {
        scrollTo: route.params.appID,
      },
    });
  };

  const selectAll = (model: string) => {
    if (model === 'screenshot') {
      const selectedSet = new Set(screenCheckList.value);
      const totalIds = screenshots.value.map((s) => s.screenIndex);
      if (selectedSet.size === totalIds.length) {
        screenCheckList.value = [];
      } else {
        screenCheckList.value = [...totalIds];
      }
    }
  };

  const handleGridMenuClick = ({ key }: MenuInfo) => {
    const clickDetail = JSON.parse(String(key));
    if (clickDetail.action === 'select') {
      selectAll('screenshot');
    } else if (clickDetail.action === 'detail') {
      detail?.value.detailShowCase(clickDetail.screen);
    } else if (clickDetail.action === 'backup') {
      option.value.showDumpOption(
        appID.value,
        useAccountStore().account.steam_id,
        screenshots.value[0].appName,
        screenshots.value[0].appLocalized,
        [clickDetail.screen.screenIndex]
      );
    } else if (clickDetail.action === 'share') {
      share.value.shareShow(appID.value, [clickDetail.screen.screenIndex]);
    }
  };

  const backToTop = () => {
    scrollArea.value?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    defaultWheelDistance = 0;
    topButtonShow.value = false;
  };

  const backToTobButtonShow = (e: WheelEvent) => {
    if (e.deltaY > 0 && selectedKeys.value[0] === '0') {
      defaultWheelDistance += e.deltaY;
      if (defaultWheelDistance >= wheelEventTrigger && screenshots.value.length > 8) {
        topButtonShow.value = true;
      }
    } else {
      defaultWheelDistance += e.deltaY;
      if (defaultWheelDistance < wheelEventTrigger) {
        topButtonShow.value = false;
        defaultWheelDistance = 0;
      }
    }
  };

  const darkModeNonAntControl = async () => {
    if (useConfigStore().config.theme === 'system') {
      const env = await window.electronAPI.getSystemEnvironment();
      darkMode.value = env.theme as boolean;
    } else {
      darkMode.value = useConfigStore().config.theme === 'dark';
    }
  };

  const backupScreenshot = async () => {
    if (screenCheckList.value.length === 0) {
      message.warning('导出截图前请先选择要导出的截图!');
    } else {
      await option.value.showDumpOption(
        appID.value,
        useAccountStore().account.steam_id,
        screenshots.value[0].appName,
        screenshots.value[0].appLocalized,
        screenCheckList.value
      );
    }
  };

  const shareScreenshotToPhone = async () => {
    if (screenCheckList.value.length === 0) {
      message.warning('分享截图前请先选择要分享的截图!');
    } else {
      await share.value.shareShow(appID.value, screenCheckList.value);
    }
  };

  const backupSuccess = () => {
    message.success(`导出成功!`);
    screenCheckList.value = [];
  };

  const shareCancle = () => {
    message.info(`分享已取消!`);
    screenCheckList.value = [];
  };

  onActivated(async () => {
    appID.value = route.params.appID as string;
    cover.value = JSON.parse(route.query.cover as string);
    await appDetailSearch('screenshot');
    await darkModeNonAntControl();
    window.addEventListener('wheel', backToTobButtonShow, { passive: true });
  });
  onDeactivated(() => {
    firstTotalQuery.value = true;
    window.removeEventListener('wheel', backToTobButtonShow);
    topButtonShow.value = false;
    defaultWheelDistance = 0;
    screenCheckList.value = [];
  });
</script>

<template>
  <a-layout-content class="flex flex-col h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden">
    <div ref="scrollArea" class="w-full h-1/2 relative">
      <span
        class="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/20 hover:bg-black/40 px-3 py-1 rounded-md text-white cursor-pointer transition-all duration-200 ease-out hover:scale-105"
        @click="goBack"
      >
        <img class="w-6 h-6" :src="back" />
        <span>返回</span>
      </span>
      <img
        class="w-full h-full object-cover"
        :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${cover.hero}`"
      />
      <img
        v-if="cover.logo && !cover.logo.endsWith('/undefined')"
        class="absolute bottom-4 right-4 max-w-[30%] h-auto"
        :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${cover.logo}`"
      />
      <div v-else class="absolute bottom-4 right-4 text-gray-950 text-5xl font-semibold">
        {{ cover.name }}
      </div>
    </div>
    <div :class="['flex items-center w-full sticky top-0 z-30', darkMode ? 'bg-dark' : 'bg-white']">
      <a-menu
        :key="route.fullPath"
        v-model:selected-keys="selectedKeys"
        mode="horizontal"
        class="flex-1"
      >
        <a-menu-item key="0">
          <span class="inline-flex items-center">
            <ScissorOutlined />
            <span class="ml-2">截图</span>
          </span>
        </a-menu-item>
        <a-menu-item key="1">
          <span class="inline-flex items-center">
            <SaveOutlined />
            <span class="ml-2">存档</span>
          </span>
        </a-menu-item>
      </a-menu>
      <div class="flex items-center gap-5 px-4">
        <a-date-picker
          v-model:value="keyword"
          :bordered="false"
          placeholder="按日期检索"
          format="YYYY-MM-DD"
          @change="(_, dateString) => appDetailSearch('screenshot', dateString)"
        />
        <div class="flex items-center gap-2">
          <PictureOutlined class="text-xl" />
          <div class="flex flex-col text-xs leading-none">
            <span>截图总数</span>
            <span>{{ totalScreen }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <FieldTimeOutlined class="text-xl" />
          <div class="flex flex-col text-xs leading-none">
            <span>游玩时间</span>
            <span>{{ cover.time }}h</span>
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1 w-full">
      <div v-if="selectedKeys[0] === '0'">
        <div class="flex-1 overflow-y-auto p-2 h-[calc(100vh-50%-60px)]">
          <a-checkbox-group v-if="screenshots.length !== 0" v-model:value="screenCheckList">
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              <div
                v-for="(screen, index) in screenshots"
                :key="index"
                class="relative cursor-pointer rounded-lg shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-200 ease-out"
              >
                <a-dropdown :trigger="['contextmenu']">
                  <div class="relative">
                    <img
                      class="w-full aspect-video object-cover rounded-lg shadow-sm"
                      :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${screen.screenThumb.replace(/\\/g, '/')}`"
                      :alt="`游戏截图 ${index + 1}`"
                      @click="showImageReviewer(screen.screenFull)"
                    />
                    <a-checkbox :value="screen.screenIndex" class="!absolute top-2 left-2" />
                  </div>
                  <template #overlay>
                    <a-menu @click="handleGridMenuClick">
                      <a-menu-item :key="JSON.stringify({ action: 'select' })">
                        <span class="inline-flex items-center">
                          <PlusSquareOutlined />
                          <span v-if="screenCheckList.length !== screenshots.length" class="ml-2"
                            >全选</span
                          >
                          <span v-else class="ml-2">取消全选</span>
                        </span>
                      </a-menu-item>
                      <a-menu-item :key="JSON.stringify({ action: 'backup', screen })">
                        <span class="inline-flex items-center">
                          <UploadOutlined />
                          <span class="ml-2">导出此截图</span>
                        </span>
                      </a-menu-item>
                      <a-menu-item :key="JSON.stringify({ action: 'share', screen })">
                        <span class="inline-flex items-center">
                          <ShareAltOutlined />
                          <span class="ml-2">分享此截图</span>
                        </span>
                      </a-menu-item>
                      <a-menu-item :key="JSON.stringify({ action: 'detail', screen })">
                        <span class="inline-flex items-center">
                          <FileImageOutlined />
                          <span class="ml-2">详细信息</span>
                        </span>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </a-checkbox-group>
          <div
            v-else-if="!screenschortsLoading"
            class="flex justify-center items-center h-full text-gray-500 pt-10"
          >
            暂无截图数据
          </div>
          <div v-else class="flex justify-center items-center h-full pt-10">
            <a-spin size="large" />
          </div>
          <a-float-button-group shape="circle">
            <a-float-button @click="backupScreenshot">
              <template #icon>
                <span class="flex items-center justify-center w-full h-full">
                  <FileSyncOutlined />
                </span>
              </template>
            </a-float-button>
            <a-float-button @click="shareScreenshotToPhone">
              <template #icon>
                <span class="flex items-center justify-center w-full h-full">
                  <ShareAltOutlined />
                </span>
              </template>
            </a-float-button>
            <a-back-top v-if="topButtonShow" :visibility-height="0" @click="backToTop" />
          </a-float-button-group>
        </div>
      </div>
      <div v-else>
        <div class="flex-1 flex justify-center items-center text-gray-500 pt-10">
          存档功能尚未实现
        </div>
      </div>
    </div>
    <a-image
      :style="{ display: 'none' }"
      :preview="{
        visible: reviewerVisiable,
        onVisibleChange: () => {
          reviewerVisiable = !reviewerVisiable;
        },
      }"
      :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${reviwerImage.replace(/\\/g, '/')}`"
    />
    <ScreenshotDetailModal ref="detail" />
    <QrCodeShareModal ref="share" @cancle="shareCancle" />
    <ScreenBackupOptionModal ref="option" @success="backupSuccess" />
  </a-layout-content>
</template>

<style scoped></style>
