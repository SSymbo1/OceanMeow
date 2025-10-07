<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { themeCalculate } from '@/renderer/hook/appearance';
  import { configStore } from './pinia/store/config';
  import { theme } from 'ant-design-vue';
  import WindowTitleBar from './components/component/application/WindowTitleBar.vue';
  import LoadingHolder from './components/component/application/LoadingHolder.vue';
  import HomeView from './components/view/home/HomeView.vue';

  const loading = ref(true);
  const loadSuccess = ref(false);
  const currentTheme = ref<'light' | 'dark'>('light');
  const themeToken = computed(() =>
    currentTheme.value === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
  );

  watch(
    () => configStore().theme,
    async (newVal) => {
      currentTheme.value = await themeCalculate(newVal);
    },
    { immediate: true }
  );
</script>

<template>
  <div class="h-screen w-screen flex flex-col">
    <!-- 应用标题栏 -->
    <WindowTitleBar />
    <div class="flex-1 w-full overflow-hidden">
      <!-- 应用加载等待界面 -->
      <LoadingHolder
        v-if="loading"
        @done="
          (state) => {
            loading = false;
            loadSuccess = state;
          }
        "
      />
      <!-- 应用主界面 -->
      <a-config-provider v-else :theme="{ algorithm: themeToken }">
        <HomeView :state="loadSuccess" :force-theme="currentTheme" />
      </a-config-provider>
    </div>
  </div>
</template>

<style scoped></style>
