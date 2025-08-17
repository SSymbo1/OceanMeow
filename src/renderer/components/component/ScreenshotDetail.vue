<script lang="ts" setup>
  import { ScreenDetail } from '@/type/electron/entity/ScreenDetail';
  import { useSteamStore } from '@/renderer/pinia/store/steam';
  import { ref } from 'vue';

  const visiable = ref(false);
  const screenDetail = ref<ScreenDetail | null>(null);

  const detailShowCase = (detail?: ScreenDetail) => {
    if (visiable.value === false && detail) {
      screenDetail.value = detail;
      visiable.value = true;
    } else if (visiable.value === true) {
      visiable.value = false;
    }
  };

  const close = () => {
    visiable.value = false;
  };

  const locateScreen = () => {
    window.electronAPI.fileLocate(
      `${useSteamStore().steam.installPath.replace(/\\/g, '/')}${screenDetail.value?.screenFull.replace(/\\/g, '/')}`
    );
  };

  defineExpose({
    detailShowCase,
  });
</script>

<template>
  <a-modal :open="visiable" centered title="详细信息" :footer="null" @cancel="close">
    <div class="min-h-90 min-w-100 flex flex-col gap-7 items-center">
      <img
        :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${screenDetail?.screenThumb.replace(/\\/g, '/')}`"
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
