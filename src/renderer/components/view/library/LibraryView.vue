<script setup lang="ts">
  import type { LibraryDetail } from '@/type/electron/entity';
  import { ref, computed, Ref, onMounted, defineAsyncComponent } from 'vue';
  import { useRouter } from 'vue-router';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import { libraryStore } from '@/renderer/pinia/store/library';

  const scrollArea = ref();
  const router = useRouter();
  const keywords = ref('');
  const loading: Ref<boolean> = ref(false);
  const library: Ref<LibraryDetail[]> = ref([]);
  const pageIndex = ref(['Grid']);
  const componentMap = {
    Grid: defineAsyncComponent(
      () => import('../../component/plugin/layout/LibraryCardGridScroll.vue')
    ),
    List: defineAsyncComponent(
      () => import('../../component/plugin/layout/LibraryCardListScroll.vue')
    ),
  };
  const currentComponent = computed(
    () => componentMap[pageIndex.value[0] as keyof typeof componentMap]
  );

  const libraryInfoSelector = async () => {
    loading.value = true;
    library.value = await window.electronAPI.queryLibraryDetail(
      steamStore().accountId,
      keywords.value
    );
    setTimeout(() => {
      loading.value = false;
    }, 1500);
  };

  onMounted(async () => {
    await libraryInfoSelector();
    if (libraryStore().libraryShow === '0') {
      pageIndex.value = ['Grid'];
    } else {
      pageIndex.value = ['List'];
    }
  });
</script>

<template>
  <div class="h-full w-full">
    <div class="h-full w-full flex flex-col">
      <!-- 库界面上部分搜索栏以及设置按钮 -->
      <div class="px-4 py-4 flex flex-row gap-3 items-center">
        <a-input-search
          v-model:value="keywords"
          allow-clear
          placeholder="搜索"
          enter-button
          size="middle"
          style="width: calc(var(--spacing) * 70)"
          @search="libraryInfoSelector"
        />
        <a-button
          type="primary"
          shape="round"
          title="设置"
          @click="router.push({ name: 'Setting', params: { subSetting: 'Library' } })"
        >
          <template #icon>
            <SettingOutlined />
          </template>
        </a-button>
      </div>
      <!-- 库页面下部分根据库设置决定是宫格式还是列表式的卡片虚拟滚动区域 -->
      <div ref="scrollArea" class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hidden">
        <component
          :is="currentComponent"
          :library="library"
          :keywords="keywords"
          :loading="loading"
          :scroller="scrollArea"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
</style>
