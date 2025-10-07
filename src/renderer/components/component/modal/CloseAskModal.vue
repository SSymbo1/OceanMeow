<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { close } from '@/renderer/assets/json/option.json';
  import { configStore } from '@/renderer/pinia/store/config';
  const visible = ref(false);
  let resolveVisible: ((val: boolean) => void) | null = null;

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

  const sendCloseRequest = async () => {
    closeModal();
    await window.electronAPI.close();
  };

  watch(
    () => [configStore().closeApplication, configStore().closeAskIgnored],
    async () => {
      await window.electronAPI.writeApplicationConfigCustom({
        common: {
          ...configStore().$state,
          closeAskIgnored: configStore().closeAskIgnored,
          closeApplication: configStore().closeApplication,
        },
      });
    }
  );
  defineExpose({
    openModal,
  });
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="退出应用"
    :footer="null"
    :closable="true"
    :width="350"
    centered
    @cancel="closeModal"
  >
    <div class="min-h-30">
      <div class="flex flex-col gap-2">
        <div>当退出应用时：</div>
        <div>
          <a-radio-group v-model:value="configStore().closeApplication">
            <a-space direction="vertical">
              <a-radio v-for="(item, index) in close" :key="index" :value="item.value">{{
                item.name
              }}</a-radio>
            </a-space>
          </a-radio-group>
        </div>
        <div
          class="flex justify-end"
          title="下次关闭时将不会弹出此对话框，你可以在设置中修改关闭应用的行为"
        >
          <a-checkbox v-model:checked="configStore().closeAskIgnored">不再询问</a-checkbox>
        </div>
        <div class="flex justify-end gap-1.5">
          <a-button type="primary" @click="sendCloseRequest">确定</a-button>
          <a-button @click="closeModal">取消</a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped></style>
