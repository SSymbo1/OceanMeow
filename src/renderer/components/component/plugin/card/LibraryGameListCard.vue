<script lang="ts" setup>
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
  <div class="group relative w-full h-20">
    <!-- 卡片hover时光效 -->
    <!-- 卡片本体 -->
    <div
      class="flex flex-row gap-5 items-center relative w-full h-full rounded-lg overflow-hidden border border-transparent group-hover:border-blue-500 transition-all duration-300 cursor-pointer"
    >
      <a-image
        :width="250"
        :src="buildLoadProtocolUrl(steamStore().installPath, props.card.appHero)"
        :preview="false"
        class="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
      />
      <div class="flex flex-row w-full justify-between">
        <div>{{ props.card.appName }}</div>
        <span v-if="libraryStore().libraryCoverInfo === '0'">{{ `${card.screenCount}张` }}</span>
        <span v-if="libraryStore().libraryCoverInfo === '1'">{{ `${card.timeHour}h` }}</span>
        <span v-if="libraryStore().libraryCoverInfo === '2'">{{ card.lastPlay }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
