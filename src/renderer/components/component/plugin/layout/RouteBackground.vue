<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { configStore } from '@/renderer/pinia/store/config';
  import { useRoute } from 'vue-router';

  const box = ref<HTMLElement>();
  const route = useRoute();

  function setBackground(fileName?: string) {
    const el = box.value;
    if (!el) return;
    /* 1. 无背景图恢复默认背景色 */
    if (!fileName) {
      el.style.backgroundImage = '';
      el.classList.remove('bg-transparent'); // 让 Ant 默认背景色生效
      return;
    }
    /* 2. 有背景图加载背景 */
    const url = `background://${fileName}`;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      el.style.backgroundImage = `url(${url})`;
      el.classList.add('bg-transparent'); // 加载成功再去背景色
    };
    img.onerror = () => {
      /* 3. 加载背景图出错恢复默认背景色 */
      el.style.backgroundImage = '';
      el.classList.remove('bg-transparent');
    };
  }

  watch(
    () => [route.name, configStore().homeBackground],
    () => {
      setBackground(configStore().homeBackground);
    },
    { immediate: true }
  );
</script>

<template>
  <div
    ref="box"
    class="h-full w-full bg-cover bg-center bg-no-repeat [&::-webkit-scrollbar]:hidden"
  >
    <slot></slot>
  </div>
</template>

<style scoped></style>
