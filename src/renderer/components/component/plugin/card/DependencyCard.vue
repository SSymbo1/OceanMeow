<script setup lang="ts">
  const { image, name } = defineProps<{
    image: string;
    name: string;
  }>();
</script>

<template>
  <a-card hoverable class="w-25">
    <div class="flex flex-col gap-2 items-center justify-center" :title="name">
      <img :src="image" class="w-15 h-15" />
      <div class="text-1xl font-bold">{{ name }}</div>
    </div>
  </a-card>
</template>

<style scoped></style>
