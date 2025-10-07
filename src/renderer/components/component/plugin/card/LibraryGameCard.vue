<script setup lang="ts">
  import type { LibraryDetail } from '@/type/electron/entity/po/LibraryDetail';
  import { buildLoadProtocolUrl } from '@/renderer/util/url';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import { libraryStore } from '@/renderer/pinia/store/library';

  const props = defineProps<{
    card: LibraryDetail;
  }>();
</script>

<template>
  <!-- 库存游戏卡片 -->
  <div class="group relative w-full h-full">
    <!-- 卡片hover时光效 -->
    <div
      class="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur-md group-hover:opacity-100 transition-all duration-500"
    ></div>
    <!-- 卡片本体 -->
    <div
      class="relative w-full h-full rounded-lg overflow-hidden border border-transparent group-hover:border-blue-500 transition-all duration-300 cursor-pointer"
    >
      <a-image
        :src="buildLoadProtocolUrl(steamStore().installPath, props.card.appPicture)"
        :preview="false"
        class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
      />
      <!-- 卡片底部hover信息 -->
      <div
        class="absolute left-1/2 -translate-x-1/2 w-4/5 px-2 py-1 bottom-[-100%] group-hover:bottom-0 text-white bg-black/60 backdrop-blur-sm text-xs text-center rounded-t-md transition-all duration-300 ease-out"
      >
        <span v-if="libraryStore().libraryCoverInfo === '0'">{{ `${card.screenCount}张` }}</span>
        <span v-if="libraryStore().libraryCoverInfo === '1'">{{ `${card.timeHour}h` }}</span>
        <span v-if="libraryStore().libraryCoverInfo === '2'">{{ card.lastPlay }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
