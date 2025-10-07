<script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { configStore } from '@/renderer/pinia/store/config';
  import { themeCalculate } from '@/renderer/hook/appearance';
  import { theme } from 'ant-design-vue';

  const currentTheme = ref<'light' | 'dark'>('light');
  const themeToken = computed(() =>
    currentTheme.value === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
  );

  const appExit = () => {
    window.electronAPI.trayClose();
  };

  watch(
    () => configStore().theme,
    async (newVal) => {
      currentTheme.value = await themeCalculate(newVal);
    },
    { immediate: true }
  );
</script>

<template>
  <a-config-provider :theme="{ algorithm: themeToken }">
    <a-menu theme="light" mode="vertical">
      <a-menu-item key="1">
        <div class="flex items-center">
          <HomeOutlined />
          <span>首页</span>
        </div>
      </a-menu-item>
      <a-menu-item key="2">
        <div class="flex items-center">
          <InboxOutlined />
          <span>库</span>
        </div>
      </a-menu-item>
      <a-menu-item key="3">
        <div class="flex items-center">
          <SettingOutlined />
          <span>设置</span>
        </div>
      </a-menu-item>
      <a-menu-item key="4">
        <div class="flex items-center">
          <LinkOutlined />
          <span>关于</span>
        </div>
      </a-menu-item>
      <a-menu-item key="5" @click="appExit">
        <div class="flex items-center">
          <LogoutOutlined />
          <span>退出应用</span>
        </div>
      </a-menu-item>
    </a-menu>
  </a-config-provider>
</template>

<style scoped></style>
