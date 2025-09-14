<script lang="ts" setup>
  import { useAccountStore } from '@/renderer/pinia/store/account';
  import { useSteamStore } from '@/renderer/pinia/store/steam';
  import { Ref, ref } from 'vue';

  const visiable = ref(false);
  const loading = ref(false);
  const shareScreen: Ref<string[]> = ref([]);
  const qrCode: Ref<string> = ref('');
  const emit = defineEmits(['cancle']);

  const shareShow = async (appID: string, files: string[]) => {
    visiable.value = true;
    loading.value = true;
    shareScreen.value = files;
    await window.electronAPI.startServer();
    const { steam_id } = useAccountStore().account;
    const shareData = {
      appID: String(appID),
      steamID: String(steam_id),
      steamPath: String(useSteamStore().steam.installPath),
      screenIndex: files.map(String),
      timeStamp: Date.now().toString(),
    };
    qrCode.value = await window.electronAPI.shareSteamScreenshot({ ...shareData });
    console.log(qrCode.value);
    loading.value = false;
  };

  const close = async () => {
    await window.electronAPI.stopServer();
    visiable.value = false;
    emit('cancle');
  };

  defineExpose({
    shareShow,
  });
</script>

<template>
  <a-modal :open="visiable" centered title="分享" :footer="null" @cancel="close">
    <div class="min-h-70 mt-5">
      <a-spin :spinning="loading" size="large" tip="正在启动分享服务，请稍候...">
        <div class="flex flex-col gap-3 items-center justify-center">
          <div>确保与分享设备位于同一个局域网内，且防火墙放行了应用端口</div>
          <div>扫描二维码即可下载分享的截图</div>
          <a-qrcode :value="qrCode" />
          <a-button type="link">如果分享存在问题，点击我</a-button>
        </div>
      </a-spin>
    </div>
  </a-modal>
</template>

<style scoped></style>
