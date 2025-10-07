<script setup lang="ts">
  const dependencies = __DEPENDENCIES__;
</script>

<template>
  <div class="h-full w-full overflow-y-auto">
    <a-list :item-layout="'horizontal'" size="large">
      <a-list-item v-for="(value, key, index) in dependencies" :key="index">
        <a-list-item-meta>
          <template #title>
            <div class="flex justify-between items-center w-full">
              <span>{{ key }}</span>
              <span>{{ value }}</span>
            </div>
          </template>
        </a-list-item-meta>
      </a-list-item>
    </a-list>
    <div class="px-4 py-4">感谢开源社区以及开源项目的每一个参与者!</div>
  </div>
</template>

<style scoped></style>
