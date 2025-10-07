<script setup lang="ts">
  import { ref } from 'vue';
  import { App } from 'ant-design-vue';

  const visible = ref(false);
  let resolveVisible: ((val: boolean) => void) | null = null;
  const emit = defineEmits(['success', 'error']);
  const { message } = App.useApp();
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

  const selectInstallPathByClick = async () => {
    const filePath = await window.electronAPI.folderSelector();
    if (filePath) {
      const validate = await window.electronAPI.validateSteamPath(filePath);
      if (validate) {
        emit('success', filePath);
        closeModal();
      } else {
        message.error(`所选择路径不是 Steam 的安装路径，请重新选择!`);
      }
    }
  };

  const selectInstallPathByDrag = async (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    for (const file of Array.from(e.dataTransfer?.files || [])) {
      const absPath = await window.electronAPI.getPathToLocalFile(file);
      const target = await window.electronAPI.steamShortcutPath(absPath);
      if (target === null) {
        message.error(`拖进应用的文件不是快捷方式!`);
      } else {
        const folderPath = target.split('\\').slice(0, -1).join('\\');
        const validate = await window.electronAPI.validateSteamPath(folderPath);
        if (validate) {
          emit('success', folderPath);
          closeModal();
        } else {
          message.error(`拖进应用的文件不是Steam的快捷方式!`);
        }
      }
    }
  };

  defineExpose({
    openModal,
  });
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="选择位置"
    :footer="null"
    :closable="true"
    centered
    @cancel="closeModal"
  >
    <div class="min-h-70 flex flex-row gap-7 items-center">
      <DropboxOutlined class="text-8xl" />
      <div class="flex flex-col gap-8">
        <span>{{ `手动为 ${projectName} 指定 Steam 在您电脑上的安装路径` }}</span>
        <div class="relative">
          <a-upload-dragger
            :show-upload-list="false"
            :before-upload="() => false"
            :custom-request="() => {}"
            :open-file-dialog-on-click="false"
            class="pl-1.5 pr-1.5"
          >
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">{{ `将 Steam 应用拖拽到此处` }}</p>
            <p class="ant-upload-hint">
              {{ `您可以点击此处手动选择Steam安装路径，或者将Steam的快捷方式拖拽到此处。` }}
            </p>
          </a-upload-dragger>
          <div
            class="absolute inset-0 cursor-pointer"
            @click="selectInstallPathByClick"
            @drop="selectInstallPathByDrag"
            @dragover.prevent
          ></div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped></style>
