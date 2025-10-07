<script setup lang="ts">
  import SteamAccountSetting from '../../component/plugin/widget/SteamAccountSetting.vue';
  import SteamInstallPathSetting from '../../component/plugin/widget/SteamInstallPathSetting.vue';
  import BackgroundSetting from '../../component/plugin/widget/BackgroundSetting.vue';
  import { themeColor, language, home, close } from '@/renderer/assets/json/option.json';
  import { storeToRefs } from 'pinia';
  import { configStore } from '@/renderer/pinia/store/config';
  import { onUnmounted } from 'vue';

  const { theme, defaultLanguage, defaultHome, closeApplication } = storeToRefs(configStore());

  // 监听common配置的store变化,将新配置写入配置文件common块
  const unsubscribe = configStore().$subscribe(async (_, state) => {
    await window.electronAPI.writeApplicationConfigCustom({
      common: {
        closeApplication: state.closeApplication,
        closeAskIgnored: state.closeAskIgnored,
        defaultHome: state.defaultHome,
        defaultLanguage: state.defaultLanguage,
        homeBackground: state.homeBackground,
        theme: state.theme,
      },
    });
  });

  onUnmounted(() => {
    unsubscribe();
  });
</script>

<template>
  <div class="h-full w-full overflow-y-auto">
    <a-divider orientation="left">Steam账户与安装位置</a-divider>
    <div class="flex flex-row py-4 justify-around">
      <SteamAccountSetting />
      <SteamInstallPathSetting />
    </div>
    <a-divider orientation="left">主题</a-divider>
    <a-form
      ref="form"
      :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
      :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 66)' }"
      label-align="right"
    >
      <a-form-item label="语言">
        <a-select v-model:value="defaultLanguage">
          <a-select-option v-for="(item, index) in language" :key="index" :value="item.value">{{
            item.name
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="应用主题">
        <a-select v-model:value="theme">
          <a-select-option v-for="(item, index) in themeColor" :key="index" :value="item.value">{{
            item.name
          }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
    <a-form
      ref="form"
      :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
      :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 100)' }"
      label-align="right"
    >
      <a-form-item label="背景">
        <BackgroundSetting />
      </a-form-item>
    </a-form>
    <a-divider orientation="left">行为</a-divider>
    <a-form
      ref="form"
      :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
      :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 66)' }"
      label-align="right"
    >
      <a-form-item label="启动后界面">
        <a-select v-model:value="defaultHome">
          <a-select-option v-for="(item, index) in home" :key="index" :value="item.value">{{
            item.name
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="应用关闭时">
        <a-radio-group v-model:value="closeApplication">
          <a-radio-button v-for="(item, index) in close" :key="index" :value="item.value">{{
            item.name
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
