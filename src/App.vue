<script setup lang="ts">
import Home from '@/components/home/Home.vue';
import { onMounted, onUnmounted } from 'vue';
import { useSteamStore } from './pinia/store/steam';
import WindowTitleBar from '@/components/component/WindowTitleBar.vue';

const fromRegGetSteamPath = async () => {
  // useSteamStore().setSteam({
  //   installPath: ''
  // })
  if (useSteamStore().steam.installPath === '') {
    const steamInstallPath = await window.electronAPI.steamRegInstallPath();
    steamInstallPath !== null ? useSteamStore().setSteam({
      installPath: steamInstallPath
    }) : useSteamStore().setSteam({
      installPath: ''
    })
  }
}

onMounted(async () => {
  await fromRegGetSteamPath();
  document.addEventListener('selectstart', (e: Event) => { e.preventDefault() }, true)
})
onUnmounted(() => {
  document.removeEventListener('selectstart', (e: Event) => { e.preventDefault() }, true)
})
</script>

<template>
  <div id="app" class="h-screen flex flex-col overflow-hidden">
    <WindowTitleBar />
    <Home />
  </div>
</template>

<style scoped></style>
