<script setup lang="ts">
  import Home from '@/renderer/components/home/HomeView.vue';
  import ApplicationInitHolder from '@/renderer/components/component/application/ApplicationInitHolder.vue';
  import WindowTitleBar from '@/renderer/components/component/application/WindowTitleBar.vue';
  import { ref, watch } from 'vue';
  import { token } from '@/renderer/assets/json/dark_mode_theme.json';
  import { useConfigStore } from '@/renderer/pinia/store/config';

  const ready = ref(false);
  const darkMode = ref(false);

  watch(
    () => [useConfigStore().config.theme, useConfigStore().config.defaultLanguage],
    async ([newValTheme, newValLang]) => {
      if (newValTheme === 'system') {
        const env = await window.electronAPI.getSystemEnvironment();
        darkMode.value = env.theme;
      } else {
        darkMode.value = newValTheme === 'dark';
      }
      if (newValLang === 'system') {
        const env = await window.electronAPI.getSystemEnvironment();
        console.log(env.local);
      }
    }
  );
</script>

<template>
  <div id="app" class="h-screen flex flex-col overflow-hidden">
    <WindowTitleBar class="flex-none" />
    <div class="flex-1 relative">
      <a-config-provider
        :theme="{
          token: darkMode ? token : {},
        }"
      >
        <a-app class="absolute inset-0" :class="ready ? 'z-10' : 'z-0 opacity-0'">
          <Home />
        </a-app>
      </a-config-provider>
      <ApplicationInitHolder
        class="absolute inset-0"
        :class="ready ? 'z-0 opacity-0' : 'z-20'"
        @ready="ready = true"
      />
    </div>
  </div>
</template>

<style scoped></style>
