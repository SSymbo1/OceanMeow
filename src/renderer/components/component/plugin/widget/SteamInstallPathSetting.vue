<script setup lang="ts">
  import { App } from 'ant-design-vue';
  import { ref, watch } from 'vue';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import InstallPathSelectModal from '../../modal/InstallPathSelectModal.vue';

  const { message } = App.useApp();
  const installPathSelectModal = ref<InstanceType<typeof InstallPathSelectModal> | null>(null);

  const selectInstallPath = async () => {
    if (installPathSelectModal.value) {
      await installPathSelectModal.value.openModal();
    }
  };

  const selectInstallPathSuccess = (path: string) => {
    steamStore().installPath = path;
    message.success('Steam安装路径设置成功');
  };

  watch(
    () => steamStore().installPath,
    () => {
      steamStore().avatar = '';
      steamStore().name = '';
      steamStore().account = '';
      steamStore().accountId = '';
    }
  );
</script>

<template>
  <div class="flex flex-col gap-4 justify-center font-bold">
    <div>Steam安装路径:</div>
    <a-input-group compact>
      <a-input :value="steamStore().installPath" readonly style="width: calc(90% - 80px)" />
      <a-button
        type="primary"
        class="!inline-flex !items-center !justify-center self-center"
        @click="selectInstallPath"
      >
        <template #icon><SelectOutlined /></template>
        <span>选择</span>
      </a-button>
    </a-input-group>
    <InstallPathSelectModal ref="installPathSelectModal" @success="selectInstallPathSuccess" />
  </div>
</template>

<style scoped></style>
