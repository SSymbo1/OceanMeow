<script lang="ts" setup>
  import { CountTo } from 'vue3-count-to';
  import type { FunctionalComponent } from 'vue';

  defineProps<{
    title: string;
    value: number;
    icon: FunctionalComponent;
  }>();
</script>

<template>
  <a-card hoverable>
    <a-statistic :title="title" :value="value">
      <template #prefix>
        <component :is="icon" />
      </template>
      <template #formatter>
        <count-to :start-val="0" :end-val="value" :duration="2000" />
      </template>
    </a-statistic>
  </a-card>
</template>

<style scoped></style>
