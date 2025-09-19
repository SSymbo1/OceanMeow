<script lang="ts" setup>
  import { useConfigStore } from '@/renderer/pinia/store/config';
  import { onMounted, onUnmounted, Ref, ref } from 'vue';

  const visiable = ref(false);
  const closeApp: Ref<string> = ref('');
  const closeAppIgnore: Ref<boolean> = ref(false);

  const showCloseModal = () => {
    closeApp.value = useConfigStore().config.defaultClose;
    closeAppIgnore.value = useConfigStore().config.closeAskIgnored;
    visiable.value = true;
  };

  const saveCloseApplication = async () => {
    useConfigStore().setConfig({
      ...useConfigStore().config,
      defaultClose: closeApp.value,
      closeAskIgnored: closeAppIgnore.value,
    });
    await window.electronAPI.writeApplicationConfigCustom({
      common: {
        ...window.electronAPI.readApplicationConfig('common'),
        closeAskIgnored: closeAppIgnore.value,
        closeApplication: closeApp.value,
      },
    });
    window.electronAPI.close();
  };

  defineExpose({
    showCloseModal,
  });
  onMounted(() => {
    window.electronAPI.closeAppModalListener(close);
  });
  onUnmounted(() => {
    window.electronAPI.removeCloseAppModalListener(close);
  });
</script>

<template>
  <a-modal
    :open="visiable"
    centered
    title="退出应用"
    :width="350"
    :footer="null"
    @cancel="
      () => {
        visiable = false;
      }
    "
  >
    <div class="min-h-30">
      <div class="flex flex-col gap-2">
        <div>当退出应用时：</div>
        <div>
          <a-radio-group v-model:value="closeApp">
            <a-space direction="vertical">
              <a-radio value="0">关闭应用</a-radio>
              <a-radio value="1">最小化至托盘</a-radio>
            </a-space>
          </a-radio-group>
        </div>
        <div
          class="flex justify-end"
          title="下次关闭时将不会弹出此对话框，你可以在设置中修改关闭应用的行为"
        >
          <a-checkbox v-model:checked="closeAppIgnore">不再询问</a-checkbox>
        </div>
        <div class="flex justify-end gap-1.5">
          <a-button type="primary" @click="saveCloseApplication">确定</a-button>
          <a-button
            @click="
              () => {
                visiable = false;
              }
            "
            >取消</a-button
          >
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped></style>
