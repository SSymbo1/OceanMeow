<script lang="ts" setup>
  import { onActivated, onMounted, ref, Ref } from 'vue';
  import { BackgroundImage } from '@/type/electron/entity/dto/BackgroundImage';
  import { useConfigStore } from '@/renderer/pinia/store/config';

  const backgroundPreview: Ref<BackgroundImage[] | null> = ref(null);
  const emit = defineEmits(['checked']);

  const getBackgrouodPreview = async () => {
    backgroundPreview.value = await window.electronAPI.getBackgroundCache();
  };

  const setApplicationBackground = async (checked: BackgroundImage) => {
    await window.electronAPI.writeApplicationConfigCustom({
      common: {
        ...(await window.electronAPI.readApplicationConfig('common')),
        homeBackground: checked.fileName,
      },
    });
    useConfigStore().setConfig({
      ...useConfigStore().config,
      homeBackground: checked.fileName,
    });
    await getBackgrouodPreview();
    emit('checked', `${checked.filePath.replace(/\\/g, '/')}/${checked.fileName}`);
  };

  onActivated(async () => {
    await getBackgrouodPreview();
  });
  onMounted(async () => {
    await getBackgrouodPreview();
  });
  defineExpose({
    getBackgrouodPreview,
  });
</script>

<template>
  <div class="flex flex-row flex-wrap gap-2 w-full">
    <a-card v-if="!backgroundPreview?.length" hoverable class="w-20 h-20"></a-card>
    <div
      v-for="(preview, index) in backgroundPreview"
      v-else
      :key="index"
      hoverable
      class="w-30 h-20 cursor-pointer rounded-lg shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-200 ease-out"
      @click="setApplicationBackground(preview)"
    >
      <div v-if="preview.isBackground" class="w-full h-full border-2 border-blue-500 rounded-lg">
        <img
          class="object-cover w-full h-full rounded-lg shadow-sm"
          :src="`load://${preview.filePath.replace(/\\/g, '/')}/${preview.fileName}`"
        />
      </div>
      <div v-else class="w-full h-full">
        <img
          class="object-cover w-full h-full rounded-lg shadow-sm"
          :src="`load://${preview.filePath.replace(/\\/g, '/')}/${preview.fileName}`"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
