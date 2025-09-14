<script setup lang="ts">
  import Home from '@/renderer/components/home/HomeView.vue';
  import ApplicationInitHolder from '@/renderer/components/component/application/ApplicationInitHolder.vue';
  import WindowTitleBar from '@/renderer/components/component/application/WindowTitleBar.vue';
  import { ref } from 'vue';

  const ready = ref(false);
</script>

<template>
  <div id="app" class="h-screen flex flex-col overflow-hidden">
    <WindowTitleBar class="flex-none" />
    <div class="flex-1 relative">
      <a-app class="absolute inset-0" :class="ready ? 'z-10' : 'z-0 opacity-0'">
        <Home />
      </a-app>
      <ApplicationInitHolder
        class="absolute inset-0"
        :class="ready ? 'z-0 opacity-0' : 'z-20'"
        @ready="ready = true"
      />
    </div>
  </div>
</template>

<style scoped></style>
