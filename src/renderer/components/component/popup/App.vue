<script lang="ts" setup>
  const appExit = () => {
    window.electronAPI.trayClose();
  };
  const applicationViewRoute = (route: string) => {
    window.electronAPI.mainWindowRouteTo(route);
  };
</script>

<template>
  <a-menu theme="light" mode="vertical">
    <a-menu-item key="1" @click="applicationViewRoute('Welcome')">
      <div class="flex items-center">
        <HomeOutlined />
        <span>首页</span>
      </div>
    </a-menu-item>
    <a-menu-item key="2" @click="applicationViewRoute('Library')">
      <div class="flex items-center">
        <InboxOutlined />
        <span>库</span>
      </div>
    </a-menu-item>
    <a-menu-item key="3" @click="applicationViewRoute('Setting')">
      <div class="flex items-center">
        <SettingOutlined />
        <span>设置</span>
      </div>
    </a-menu-item>
    <a-menu-item key="4" @click="applicationViewRoute('About')">
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
</template>

<style scoped></style>
