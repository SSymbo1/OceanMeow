<script lang="ts" setup>
  import icon from '@/renderer/assets/icon/icon.ico';
  import CloseApplicationModal from '../modal/CloseApplicationModal.vue';
  import { ref } from 'vue';
  import { useConfigStore } from '@/renderer/pinia/store/config';

  const closeModal = ref();

  const minimize = () => window.electronAPI.minimize();
  const close = () => {
    if (useConfigStore().config.closeAskIgnored) {
      window.electronAPI.close();
    } else {
      closeModal.value.showCloseModal();
    }
  };
</script>

<template>
  <header
    class="flex items-center justify-between h-8 pl-3 py-0 bg-blue-950 text-neutral-100 select-none"
    style="-webkit-app-region: drag"
  >
    <div class="flex items-center space-x-2">
      <img :src="icon" alt="logo" class="w-5 h-5" />
      <span class="text-sm">Application</span>
    </div>
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
        class="w-11 h-8 text-neutral-300 hover:bg-red-600 hover:text-white cursor-pointer flex items-center justify-center transition-colors"
        @click="close"
      >
        <span class="text-lg leading-none">×</span>
      </button>
    </nav>
    <CloseApplicationModal ref="closeModal" />
  </header>
</template>

<style scoped></style>
