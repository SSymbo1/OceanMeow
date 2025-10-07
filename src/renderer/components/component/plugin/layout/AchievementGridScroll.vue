<script setup lang="ts">
  import emptyIcon from '@/renderer/assets/icon/empty.svg';
</script>

<template>
  <div class="px-4 py-2">
    <a-empty
      :image="emptyIcon"
      :image-style="{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }"
    >
      <template #description>
        <div>成就功能暂未实现</div>
        <div class="mt-1">与存档功能一并开发中，敬请期待。</div>
      </template>
    </a-empty>
  </div>
</template>

<style scoped></style>
