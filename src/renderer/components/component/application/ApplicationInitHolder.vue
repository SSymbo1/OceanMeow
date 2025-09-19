<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { useSteamStore } from '@/renderer/pinia/store/steam';
  import { useConfigStore } from '@/renderer/pinia/store/config';

  const emit = defineEmits(['ready']);

  const applicationLoading = async () => {
    let steamInstallPath: string | null;
    // todo：这里代码逻辑有问题
    if (useSteamStore().steam.installPath === '') {
      steamInstallPath = await window.electronAPI.steamRegInstallPath();
      if (!steamInstallPath) {
        setTimeout(() => {
          emit('ready');
        }, 1000);
        return;
      }
      useSteamStore().setSteam({ installPath: steamInstallPath });
    } else {
      steamInstallPath = useSteamStore().steam.installPath;
    }
    await window.electronAPI.collectAccountData(steamInstallPath);
    await Promise.all([
      window.electronAPI.collectLibraryData(steamInstallPath),
      window.electronAPI.collectScreenshotData(steamInstallPath),
    ]);
    const config = await window.electronAPI.readApplicationConfig();
    useConfigStore().setConfig({
      theme: config.common.theme,
      defaultClose: config.common.closeApplication,
      defaultHome: config.common.defaultHome,
      defaultLanguage: config.common.defaultLanguage,
      homeBackground: config.common.homeBackground,
      libraryShow: config.library.libraryShow,
      librarySort: config.library.librarySort,
      librarySortOrder: config.library.librarySortOrder,
      libraryCoverInfo: config.library.libraryCoverInfo,
      closeAskIgnored: config.common.closeAskIgnored,
    });
    setTimeout(() => {
      emit('ready');
    }, 1000);
  };

  onMounted(async () => {
    await applicationLoading();
  });
</script>

<template>
  <div class="flex-1 h-full w-full bg-blue-950">
    <div class="flex flex-col justify-center items-center h-full w-full">
      <div class="max-w-xs max-h-60">
        <svg
          class="fixed-icon"
          viewBox="-40 -40 1180 1180"
          width="150"
          height="150"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M289.998181 83.132655a187.111589 187.111589 0 0 0-48.666289 4.927218c0.010015 0-0.007511-0.07511 0-0.07511a187.324401 187.324401 0 0 0-107.031784 70.177799c-0.125183 0.170249-0.265389 0.378054-0.390573 0.550807C76.693222 236.635012 27.268323 368.781086 27.268323 733.690621A257.301907 257.301907 0 0 0 102.613692 915.679707a257.316929 257.316929 0 0 0 181.986582 75.345369h504.799452A257.334455 257.334455 0 0 0 971.386308 915.679707a257.299403 257.299403 0 0 0 75.345369-181.986582c0-364.724264-49.387345-497.366064-107.502474-574.982259a187.1191 187.1191 0 0 0-106.951668-70.10269c-42.817721-10.112313-87.848685-4.879648-127.141242 14.866778-0.207804 0.105154-0.418112 0.205301-0.625916 0.312958-30.850191 15.863237-59.714973 35.201565-86.376529 57.271394a439.303511 439.303511 0 0 0-162.267696 0c-26.754191-22.27513-55.684068-41.736137-86.689487-57.742084-0.242856-0.125183-0.538289-0.267892-0.783648-0.390572a187.006435 187.006435 0 0 0-78.394836-19.793995z"
            fill="#162456"
            stroke="#ffffff"
            stroke-width="80"
            stroke-linecap="round"
          />
          <path
            d="M289.998181 83.132655a187.111589 187.111589 0 0 0-48.666289 4.927218c0.010015 0-0.007511-0.07511 0-0.07511a187.324401 187.324401 0 0 0-107.031784 70.177799c-0.125183 0.170249-0.265389 0.378054-0.390573 0.550807C76.693222 236.635012 27.268323 368.781086 27.268323 733.690621A257.301907 257.301907 0 0 0 102.613692 915.679707a257.316929 257.316929 0 0 0 181.986582 75.345369h504.799452A257.334455 257.334455 0 0 0 971.386308 915.679707a257.299403 257.299403 0 0 0 75.345369-181.986582c0-364.724264-49.387345-497.366064-107.502474-574.982259a187.1191 187.1191 0 0 0-106.951668-70.10269c-42.817721-10.112313-87.848685-4.879648-127.141242 14.866778-0.207804 0.105154-0.418112 0.205301-0.625916 0.312958-30.850191 15.863237-59.714973 35.201565-86.376529 57.271394a439.303511 439.303511 0 0 0-162.267696 0c-26.754191-22.27513-55.684068-41.736137-86.689487-57.742084-0.242856-0.125183-0.538289-0.267892-0.783648-0.390572a187.006435 187.006435 0 0 0-78.394836-19.793995z"
            fill="none"
            stroke="#ffffff"
            stroke-width="80"
            stroke-linecap="round"
            class="stroke-glow"
          />
          <path
            d="M745.82089 438.105134c-2.493653 0.005007-5.049897 0.255374-7.588616 0.781145l-107.031785 22.142435c-20.309751 4.208665-33.311296 24.130347-29.105134 44.440098 4.206161 20.309751 24.052733 33.3138 44.362484 29.105134l107.031784-22.139931c20.309751-4.208665 33.38891-24.052733 29.182749-44.362484-3.680391-17.771032-19.383394-30.008958-36.851482-29.966397zM327.553193 438.105134c-17.468088-0.042562-33.17109 12.195364-36.851482 29.966397-4.206161 20.309751 8.872998 40.153819 29.182749 44.362484l107.031784 22.139931c20.309751 4.208665 40.156323-8.795384 44.362485-29.105134 4.206161-20.309751-8.872998-40.231433-29.182749-44.440098l-107.031784-22.142435a37.124381 37.124381 0 0 0-7.511003-0.781145z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @keyframes lightMove {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -3397;
    }
  }
  .stroke-glow {
    stroke-dasharray: 200 3197;
    animation: lightMove 2s linear infinite;
    filter: drop-shadow(0 0 8px #fff) drop-shadow(0 0 16px #fff) drop-shadow(0 0 32px #fff);
  }
</style>
