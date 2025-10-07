<script setup lang="ts">
  import icon from '@/renderer/assets/icon/logo.svg';
  import CloseAskModal from '../modal/CloseAskModal.vue';
  import { ref } from 'vue';
  import { configStore } from '@/renderer/pinia/store/config';

  const closeAskModal = ref<InstanceType<typeof CloseAskModal> | null>(null);
  const applicationName = __PROJECT_NAME__;
  const minimize = () => {
    window.electronAPI.minimize();
  };
  const close = async () => {
    if (closeAskModal.value && !configStore().closeAskIgnored) {
      await closeAskModal.value.openModal();
    } else {
      window.electronAPI.close();
    }
  };
</script>

<template>
  <header
    class="h-8 px-3 flex items-center justify-between bg-blue-950 text-slate-100 select-none transition-colors"
    style="-webkit-app-region: drag"
  >
    <!-- 左侧：图标 + 名称 -->
    <div class="flex items-center gap-2">
      <img :src="icon" alt="logo" class="w-4 h-4" />
      <span class="text-sm tracking-wide">{{ applicationName }}</span>
    </div>
    <!-- 可拖拽区 -->
    <div class="flex-1"></div>
    <!-- 最小化，关闭按钮区域 -->
    <nav class="flex" style="-webkit-app-region: no-drag">
      <button
        title="最小化"
        class="w-11 h-8 text-neutral-300 hover:bg-blue-400 cursor-pointer flex items-center justify-center transition-colors"
        @click="minimize"
      >
        <span class="text-lg leading-none pb-0.5">－</span>
      </button>
      <button
        title="关闭"
        class="w-11 h-8 text-neutral-300 hover:bg-red-600 cursor-pointer flex items-center justify-center transition-colors"
        @click="close"
      >
        <span class="text-lg leading-none">×</span>
      </button>
    </nav>
    <CloseAskModal ref="closeAskModal" />
  </header>
</template>

<style scoped></style>
