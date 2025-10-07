<script setup lang="ts">
  defineProps<{ direction: 'left' | 'right' }>();
</script>

<template>
  <transition :name="`slide-${direction}`" mode="out-in">
    <slot></slot>
  </transition>
</template>

<style scoped>
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: all 0.2s cubic-bezier(0.55, 0, 0.1, 1);
  }
  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(50px);
  }
  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(-50px);
  }
  .slide-right-enter-from {
    opacity: 0;
    transform: translateX(-50px);
  }
  .slide-right-leave-to {
    opacity: 0;
    transform: translateX(50px);
  }
</style>
