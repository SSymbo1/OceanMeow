<script lang="ts" setup>
  const appExit = () => {
    window.electronAPI.quit();
  };
</script>

<template>
  <div class="h-full flxe-1 flex-col items-center justify-center">
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
  </div>
</template>

<style scoped></style>
