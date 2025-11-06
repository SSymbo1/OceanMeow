<script setup lang="ts">
  import { configStore } from '@/renderer/pinia/store/config';
  import { ref } from 'vue';

  const visible = ref(false);
  let resolveVisible: ((val: boolean) => void) | null = null;
  const projectName = __PROJECT_NAME__;

  const openModal = async (): Promise<boolean> => {
    visible.value = true;
    return new Promise<boolean>((resolve) => {
      resolveVisible = resolve;
    });
  };

  const closeModal = () => {
    visible.value = false;
    resolveVisible?.(false);
  };

  const selectBackgroundFileLocalFile = async () => {
    const image = await window.electronAPI.fileSelector('图片', ['png', 'jpg', 'jpeg', 'webp']);
    if (image) {
      const background = await window.electronAPI.writeBackgroundCache(image);
      configStore().homeBackground = background;
      closeModal();
    }
  };

  defineExpose({
    openModal,
  });
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="选择以何种方式导入背景"
    :footer="null"
    :closable="true"
    centered
    @cancel="closeModal"
  >
    <div class="min-h-70 flex flex-row gap-7 items-center">
      <a-upload-dragger
        :show-upload-list="false"
        :before-upload="() => false"
        :custom-request="() => {}"
        :open-file-dialog-on-click="false"
        class="pl-1.5 pr-1.5"
        @click="selectBackgroundFileLocalFile"
      >
        <p class="ant-upload-drag-icon">
          <FolderOpenOutlined />
        </p>
        <p class="ant-upload-text">{{ `从电脑上选择一张图片` }}</p>
        <p class="ant-upload-hint">
          {{ `在运行 ${projectName} 的计算机或局域网上选择一张图片作为背景图片` }}
        </p>
      </a-upload-dragger>
      <a-upload-dragger
        :show-upload-list="false"
        :before-upload="() => false"
        :custom-request="() => {}"
        :open-file-dialog-on-click="false"
        :disabled="true"
        title="暂未实现"
        class="pl-1.5 pr-1.5"
      >
        <p class="ant-upload-drag-icon">
          <PictureOutlined />
        </p>
        <p class="ant-upload-text">{{ `从游戏截图中选择` }}</p>
        <p class="ant-upload-hint">
          {{ `在 ${projectName} 采集到的游戏截图中选择一张截图作为背景图片` }}
        </p>
      </a-upload-dragger>
    </div>
  </a-modal>
</template>

<style scoped></style>
