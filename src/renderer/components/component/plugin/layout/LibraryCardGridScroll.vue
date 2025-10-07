<script setup lang="ts">
  import type { LibraryDetail } from '@/type/electron/entity';
  import { useRouter, useRoute } from 'vue-router';
  import { nextTick, watch } from 'vue';
  import emptyIcon from '@/renderer/assets/icon/empty.svg';
  import LibraryGameCard from '../card/LibraryGameCard.vue';

  const router = useRouter();
  const route = useRoute();

  const props = defineProps<{
    library: LibraryDetail[];
    keywords: string;
    loading: boolean;
    scroller: any;
  }>();

  // todo:返回定位功能暂时有问题，待修复
  const backScrollTo = watch(
    () => props.loading,
    async (loading) => {
      if (loading || !props.library.length) return;
      await nextTick();
      const scrollToCard = route.params.scroll as string;
      if (!scrollToCard) return;
      const rollSelector = props.scroller.querySelector(`[scroll-to="${scrollToCard}"]`);
      rollSelector?.scrollIntoView({ block: 'center' });
      backScrollTo();
    },
    { immediate: true }
  );
</script>

<template>
  <!-- 骨架屏加载 -->
  <div
    v-if="loading"
    class="px-4 py-2 grid gap-4 justify-items-center"
    style="grid-template-columns: repeat(auto-fill, minmax(148px, 1fr))"
  >
    <div
      v-for="i in 8"
      :key="i"
      class="w-[148px] h-[200px] bg-gray-200 rounded-lg animate-pulse"
    ></div>
  </div>
  <!-- 宫格式LibraryGameCard布局 -->
  <div v-else>
    <!-- 非空LibraryDetail结果显示 -->
    <div
      v-if="library.length !== 0"
      class="px-4 py-2 grid gap-4 justify-items-center"
      style="grid-template-columns: repeat(auto-fill, minmax(148px, 1fr))"
    >
      <LibraryGameCard
        v-for="(item, index) in library"
        :key="index"
        :card="item"
        :scroll-to="item.appId"
        @click="router.push({ name: 'Game', params: { appID: item.appId } })"
      />
    </div>
    <!-- 空LibraryDetail结果显示 -->
    <div v-else class="px-4 py-2">
      <a-empty
        :image="emptyIcon"
        :image-style="{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }"
        class="mt-20"
      >
        <template #description>
          <!-- 库存不为空但关键字检索为空 -->
          <div v-if="keywords">{{ `没有从您的库中找到 “${keywords}” ` }}</div>
          <!-- 库存为空 -->
          <div v-else>{{ `未检索到库存` }}</div>
          <div class="mt-1">
            {{ `受限于从本地库中检索，您可能需要重新启动Steam客户端以获取最新库存信息。` }}
          </div>
        </template>
      </a-empty>
    </div>
  </div>
  <a-float-button-group shape="circle">
    <a-back-top :target="() => scroller" />
  </a-float-button-group>
</template>

<style scoped></style>
