<script setup lang="ts">
  import type { ScreenDetail } from '@/type/electron/entity/po/ScreenDetail';
  import { ref } from 'vue';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import { buildLoadProtocolUrl } from '@/renderer/util/url';

  const visible = ref(false);
  let resolveVisible: ((val: boolean) => void) | null = null;
  const screenDetail = ref<ScreenDetail | null>(null);

  const openModal = async (detail: ScreenDetail): Promise<boolean> => {
    visible.value = true;
    screenDetail.value = detail;
    return new Promise<boolean>((resolve) => {
      resolveVisible = resolve;
    });
  };

  const closeModal = () => {
    visible.value = false;
    resolveVisible?.(false);
  };

  const locateScreen = () => {
    window.electronAPI.fileLocate(
      `${steamStore().installPath.replace(/\\/g, '/')}${screenDetail.value?.screenFull.replace(/\\/g, '/')}`
    );
  };

  defineExpose({
    openModal,
  });
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="截图详情"
    :footer="null"
    :closable="true"
    centered
    @cancel="closeModal"
  >
    <div class="min-h-90 min-w-100 flex flex-col gap-7 items-center">
      <img
        :src="`${buildLoadProtocolUrl(steamStore().installPath, screenDetail?.screenThumb as string)}`"
      />
      <div>{{ screenDetail?.screenFull.replace(/^.*[/\\]/, '') }}</div>
      <div class="flex flex-col gap-2 items-start">
        <span>{{ `游戏：${screenDetail?.appLocalized}` }}</span>
        <span>{{ `创建时间：${screenDetail?.creation}` }}</span>
        <span>{{ `分辨率：${screenDetail?.width}*${screenDetail?.height}` }}</span>
        <span
          >{{ `位置：`
          }}<a-button type="link" size="small" @click="locateScreen">点击打开</a-button></span
        >
      </div>
    </div>
  </a-modal>
</template>

<style scoped></style>
