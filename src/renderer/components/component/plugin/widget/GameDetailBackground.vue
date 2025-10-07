<script setup lang="ts">
  import back from '@/renderer/assets/icon/back.svg';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import { buildLoadProtocolUrl } from '@/renderer/util/url';
  import router from '@/renderer/router/main';

  const props = defineProps<{
    hero: string;
    logo: string;
    name: string;
    game: string;
  }>();

  const goBack = () => {
    router.push({ name: 'Library', params: { scroll: props.game } });
  };
</script>

<template>
  <div ref="scrollArea" class="w-full h-1/2 relative">
    <!-- 游戏cover左上角返回按钮 -->
    <span
      class="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/20 hover:bg-black/40 px-3 py-1 rounded-md text-white cursor-pointer transition-all duration-200 ease-out hover:scale-105"
      @click="goBack"
    >
      <img class="w-6 h-6" :src="back" />
      <span>返回</span>
    </span>
    <img
      class="w-full h-full object-cover"
      :src="buildLoadProtocolUrl(steamStore().installPath, hero)"
    />
    <img
      v-if="logo && !logo.endsWith('/undefined')"
      class="absolute bottom-4 right-4 max-w-[30%] h-auto"
      :src="buildLoadProtocolUrl(steamStore().installPath, logo)"
    />
    <div v-else class="absolute bottom-4 right-4 text-gray-950 text-5xl font-semibold">
      {{ name }}
    </div>
  </div>
</template>

<style scoped></style>
