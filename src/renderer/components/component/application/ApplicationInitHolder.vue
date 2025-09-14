<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { useSteamStore } from '@/renderer/pinia/store/steam';
  import { useConfigStore } from '@/renderer/pinia/store/config';

  const emit = defineEmits(['ready']);

  const applicationLoading = async () => {
    let steamInstallPath: string | null;
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
      theme: config.theme,
      defaultClose: config.closeApplication,
      defaultHome: config.defaultHome,
      defaultLanguage: config.defaultLanguage,
      libraryShow: config.libraryShow,
      librarySort: config.librarySort,
      librarySortOrder: config.librarySortOrder,
      libraryCoverInfo: config.libraryCoverInfo,
      closeAskIgnored: config.closeAskIgnored,
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
          t="1754660411228"
          class="icon"
          viewBox="0 0 1700 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="3318"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          width="150"
          height="150"
        >
          <path
            d="M1527.229741 799.563294a60.102776 60.102776 0 0 1-74.330353 41.345506 60.235294 60.235294 0 0 1-41.261176-74.474918 185.247624 185.247624 0 0 0-2.349177-109.435482l-135.360753-409.094024A185.319906 185.319906 0 0 0 1097.764141 120.470588H441.344A185.344 185.344 0 0 0 265.155765 247.904376L129.819106 656.9984c-15.637082 47.296753-11.950682 98.123294 10.408659 143.094965 22.311153 44.935529 60.452141 78.269741 107.363388 93.858635 46.766682 15.540706 96.954729 11.589271 141.312-11.107388a187.765459 187.765459 0 0 0 93.244235-108.821083l8.914824-26.901082a184.32 184.32 0 0 1 175.176282-126.735059h206.607059a184.32 184.32 0 0 1 175.200376 126.735059l8.902777 26.901082c25.214494 76.209694 97.629365 129.445647 176.115953 129.4336 15.058824 0 30.165835-1.867294 44.863247-5.565741a60.114824 60.114824 0 0 1 72.920847 43.803106 60.235294 60.235294 0 0 1-43.718777 73.053365c-24.250729 6.083765-49.152 9.167812-74.05327 9.167812-63.728941 0-125.144847-20.046306-177.597741-57.982495a308.452894 308.452894 0 0 1-112.64-154.0096l-8.914824-26.901082a64.246965 64.246965 0 0 0-61.066541-44.188612h-206.607059a64.259012 64.259012 0 0 0-61.078588 44.176565l-8.902777 26.913129c-25.696376 77.691482-79.920188 140.974682-152.69647 178.200095-73.246118 37.466353-156.250353 43.923576-233.821365 18.154917-77.522824-25.744565-140.444612-80.618918-177.152-154.503529C-3.999624 780.119341-9.999059 696.777788 15.709365 619.098353L151.070118 210.004329A305.392941 305.392941 0 0 1 441.344 0h656.420141a305.392941 305.392941 0 0 1 290.28593 210.004329l135.348705 409.094024a305.477271 305.477271 0 0 1 3.830965 180.464941zM1055.081412 216.847059a60.175059 60.175059 0 0 0-60.114824 60.235294 60.163012 60.163012 0 0 0 60.114824 60.223247 60.175059 60.175059 0 0 0 60.114823-60.223247c0-33.273976-26.913129-60.235294-60.114823-60.235294z m0 361.38767a60.175059 60.175059 0 0 0 60.114823-60.235294 60.175059 60.175059 0 0 0-60.114823-60.223247 60.163012 60.163012 0 0 0-60.114824 60.235294c0 33.249882 26.925176 60.235294 60.114824 60.235294zM934.851765 337.293553a60.175059 60.175059 0 0 0-60.102777 60.235294c0 33.273976 26.913129 60.235294 60.114824 60.235294a60.175059 60.175059 0 0 0 60.114823-60.235294c0-33.273976-26.913129-60.235294-60.114823-60.235294z m240.459294 120.470588a60.175059 60.175059 0 0 0 60.114823-60.235294c0-33.273976-26.913129-60.235294-60.114823-60.235294a60.175059 60.175059 0 0 0-60.114824 60.235294c0 33.249882 26.913129 60.235294 60.114824 60.235294z m-691.296377 120.470588a60.175059 60.175059 0 0 0 60.114824-60.235294v-60.235294h60.114823a60.175059 60.175059 0 0 0 60.114824-60.235294c0-33.273976-26.925176-60.235294-60.114824-60.235294h-60.114823v-60.223247c0-33.273976-26.913129-60.235294-60.114824-60.235294a60.175059 60.175059 0 0 0-60.114823 60.235294v60.223247h-60.114824a60.175059 60.175059 0 0 0-60.114823 60.235294c0 33.273976 26.925176 60.235294 60.114823 60.235294h60.114824v60.235294c0 33.249882 26.913129 60.235294 60.114823 60.235294z"
            fill="#ffffff"
            p-id="3319"
            stroke="#ffffff"
            stroke-width="12"
            stroke-linecap="round"
            class="stroke-glow"
          ></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @keyframes lightMove {
    0% {
      stroke-dashoffset: 6000;
    }

    100% {
      stroke-dashoffset: 0;
    }
  }

  .stroke-glow {
    stroke-dasharray: 200 6000;
    animation: lightMove 2s linear infinite;
    filter: drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px #ffffff) drop-shadow(0 0 24px #ffffff);
  }
</style>
