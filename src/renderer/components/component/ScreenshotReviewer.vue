<script lang="ts" setup>
  import { ref } from 'vue';
  import { ScreenDetail } from '@/type/electron/entity/ScreenDetail';
  import { useSteamStore } from '@/renderer/pinia/store/steam';

  const visiable = ref(false);
  const renderScreen = ref<ScreenDetail | null>(null);

  const reviewer = (screen?: ScreenDetail) => {
    if (visiable.value === false && screen) {
      renderScreen.value = screen;
      visiable.value = true;
    } else if (visiable.value === true) {
      visiable.value = false;
    }
  };

  const close = () => {
    visiable.value = false;
  };

  defineExpose({
    reviewer,
  });
</script>

<template>
  <a-modal
    width="100%"
    wrap-class-name="
        [&_.ant-modal]:!max-w-none
        [&_.ant-modal]:!h-screen
        [&_.ant-modal]:!m-0
        [&_.ant-modal]:!top-0
        [&_.ant-modal]:!bg-transparent
        [&_.ant-modal-content]:!bg-transparent
        [&_.ant-modal-mask]:!bg-transparent
        [&_.ant-modal-header]:!bg-transparent"
    :open="visiable"
    centered
    title="&nbsp;"
    :footer="null"
    :closable="false"
    @click.stop="close"
    @cancel="close"
  >
    <div class="h-114 w-full flex justify-center items-center px-1 py-1" @click.stop="close">
      <img
        class="h-full"
        :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${renderScreen?.screenFull}`"
        alt="截图预览"
        @click.stop="close"
      />
    </div>
  </a-modal>
</template>

<style scoped></style>
