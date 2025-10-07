<script setup lang="ts">
  import type { BackgroundImage } from '@/type/electron/entity';
  import { onMounted, ref, Ref, watch } from 'vue';
  import { buildLoadProtocolUrl } from '@/renderer/util/url';
  import { configStore } from '@/renderer/pinia/store/config';
  import SelectBackgroundModal from '../../modal/SelectBackgroundModal.vue';

  const selectBackgroundModal = ref<InstanceType<typeof SelectBackgroundModal> | null>(null);
  const background: Ref<BackgroundImage[] | null> = ref(null);

  const selectBackground = async () => {
    if (selectBackgroundModal.value) {
      await selectBackgroundModal.value.openModal();
    }
  };

  watch(
    () => configStore().homeBackground,
    async () => {
      background.value = await window.electronAPI.getBackgroundCache();
    }
  );
  onMounted(async () => {
    background.value = await window.electronAPI.getBackgroundCache();
  });
</script>

<template>
  <!-- 背景选择设置组件 -->
  <div class="w-full flex flex-row flex-wrap gap-2 cursor-pointer">
    <div
      v-for="(preview, index) in background"
      :key="index"
      hoverable
      class="w-30 h-20 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-200 ease-out"
    >
      <!-- 可供选择的背景图片 -->
      <div
        :class="
          preview.fileName === configStore().homeBackground
            ? 'w-full h-full border-2 border-blue-500 rounded-lg'
            : 'w-full h-full '
        "
        @click="configStore().homeBackground = preview.thumbName"
      >
        <img
          class="object-cover w-full h-full rounded-lg shadow-sm"
          :src="buildLoadProtocolUrl(preview.filePath, preview.thumbName)"
        />
      </div>
    </div>
    <!-- 点击添加组件 -->
    <div
      class="w-30 h-20 border-1 cursor-pointer rounded-lg shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-200 ease-out"
      @click="selectBackground"
    >
      <div class="w-full h-full flex justify-center items-center">
        <PlusOutlined class="text-4xl" />
      </div>
    </div>
    <SelectBackgroundModal ref="selectBackgroundModal" />
  </div>
</template>

<style scoped></style>
