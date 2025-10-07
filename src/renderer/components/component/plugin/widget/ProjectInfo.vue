<script setup lang="ts">
  const {
    logo,
    name,
    version,
    address,
    license,
    platform = '',
  } = defineProps<{
    logo: string;
    name: string;
    version: string;
    address: string;
    license: string;
    platform?: string;
  }>();
</script>

<template>
  <div class="flex flex-row items-center gap-4">
    <img :src="logo" class="w-20" />
    <div class="flex flex-col gap-1">
      <div class="text-2xl font-bold">{{ name }}</div>
      <div v-if="platform !== ''" class="text-1xl font-bold">
        {{ `${version} for ${platform}` }}
      </div>
      <div v-else class="text-1xl font-bold">{{ version }}</div>
      <div class="text-1xl font-bold">{{ license }}</div>
      <div>{{ address }}</div>
    </div>
  </div>
</template>

<style scoped></style>
