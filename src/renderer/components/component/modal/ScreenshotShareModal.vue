<script setup lang="ts">
  import { ref, Ref } from 'vue';
  import { steamStore } from '@/renderer/pinia/store/steam';

  const loading = ref(false);
  const visible = ref(false);
  const helpPrompt = ref(false);
  const shareScreen: Ref<string[]> = ref([]);
  const qrCode: Ref<string> = ref('');
  let resolveVisible: ((val: boolean) => void) | null = null;

  const openModal = async (appID: string, files: string[]): Promise<boolean> => {
    visible.value = true;
    loading.value = true;
    shareScreen.value = files;
    await window.electronAPI.startServer();
    const shareData = {
      appID: String(appID),
      steamID: String(steamStore().accountId),
      steamPath: String(steamStore().installPath),
      screenIndex: files.map(String),
      timeStamp: Date.now().toString(),
    };
    qrCode.value = await window.electronAPI.shareSteamScreenshot({ ...shareData });
    loading.value = false;
    console.log(qrCode.value);
    return new Promise<boolean>((resolve) => {
      resolveVisible = resolve;
    });
  };

  const closeModal = async () => {
    await window.electronAPI.stopServer();
    visible.value = false;
    helpPrompt.value = false;
    resolveVisible?.(false);
  };

  defineExpose({
    openModal,
  });
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="截图分享"
    :footer="null"
    :closable="true"
    centered
    @cancel="closeModal"
  >
    <div class="min-h-70 mt-5">
      <div v-if="helpPrompt">
        <a-timeline>
          <a-timeline-item>
            <div>{{ `Q:扫描二维码打开的界面图片裂开(404)` }}</div>
            <div class="mt-1">
              {{ `A:您可能手动在文件管理器中删除了截图而不是在steam的截图管理器中删除了截图` }}
            </div>
          </a-timeline-item>
          <a-timeline-item>
            <div>{{ `Q:扫描二维码后无法打开界面或跳转到 https://www.antdv.com/` }}</div>
            <div class="mt-1">
              {{
                `A:很大概率您没有和此设备位于同一个网络环境下，或防火墙入站规则没有放行本应用的分享功能端口`
              }}
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
      <div v-else>
        <a-spin :spinning="loading" size="large" tip="正在启动分享服务，请稍候...">
          <div class="flex flex-col gap-3 items-center justify-center">
            <div>{{ `确保与分享设备位于同一个局域网内，且防火墙放行了应用端口` }}</div>
            <div>{{ `扫描二维码即可下载分享的截图` }}</div>
            <a-qrcode :value="qrCode" />
            <a-button type="link" @click="helpPrompt = true">{{
              `如果分享存在问题，点击我`
            }}</a-button>
          </div>
        </a-spin>
      </div>
    </div>
  </a-modal>
</template>

<style scoped></style>
