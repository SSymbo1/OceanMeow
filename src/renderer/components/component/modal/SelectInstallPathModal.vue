<script lang="ts" setup>
  import { ref } from 'vue';
  import { useSteamStore } from '@/renderer/pinia/store/steam';
  import { App } from 'ant-design-vue';

  const visiable = ref(false);
  const { message } = App.useApp();
  const resolvePromise = ref<(() => void) | null>(null);
  const emit = defineEmits(['success']);

  const handleUploaderDragFile = async (e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
    for (const file of Array.from(e.dataTransfer?.files || [])) {
      const absPath = await window.electronAPI.getPathToLocalFile(file);
      const target = await window.electronAPI.steamShortcutPath(absPath);
      if (target === null) {
        message.error('拖进应用的文件不是快捷方式!');
      } else {
        const folderPath = target.split('\\').slice(0, -1).join('\\');
        const validate = await window.electronAPI.validateSteamPath(folderPath);
        if (validate) {
          useSteamStore().setSteam({
            installPath: folderPath,
          });
          emit('success');
          visiable.value = !visiable.value;
          finish();
        } else {
          message.error('拖进应用的文件不是Steam的快捷方式!');
        }
      }
    }
  };

  const handleUploaderSelectFile = async () => {
    const filePath = await window.electronAPI.folderSelector();
    if (filePath !== null) {
      const validate = await window.electronAPI.validateSteamPath(filePath);
      if (validate) {
        useSteamStore().setSteam({
          installPath: filePath,
        });
        emit('success');
        visiable.value = !visiable.value;
        finish();
      } else {
        message.error('所选择路径不是Steam的安装路径，请重新选择!');
      }
    }
  };

  const openAndWait = (): Promise<void> => {
    return new Promise<void>((resolve) => {
      visiable.value = true;
      resolvePromise.value = resolve;
    });
  };

  const finish = () => {
    if (resolvePromise.value) {
      resolvePromise.value();
      resolvePromise.value = null;
    }
  };

  defineExpose({
    openAndWait,
  });
</script>

<template>
  <a-modal
    :open="visiable"
    centered
    title="请手动选择Steam安装路径"
    :footer="null"
    :closable="false"
  >
    <div class="min-h-70 flex flex-row gap-7 items-center">
      <DropboxOutlined class="text-8xl" />
      <div class="flex flex-col gap-8">
        <span>Application没能成功在您的电脑上识别到Steam的安装路径，请手动选择安装路径。</span>
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
            <p class="ant-upload-text">将Steam应用拖拽到此处</p>
            <p class="ant-upload-hint">
              您可以点击此处手动选择Steam安装路径，或者将Steam的快捷方式拖拽到此处。
            </p>
          </a-upload-dragger>
          <div
            class="absolute inset-0 cursor-pointer"
            @click="handleUploaderSelectFile"
            @drop="handleUploaderDragFile"
            @dragover.prevent
          ></div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped></style>
