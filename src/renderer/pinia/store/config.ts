import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';

interface Config {
  theme: string;
  defaultClose: string;
  defaultHome: string;
  defaultLanguage: string;
  homeBackground: string;
  libraryShow: string;
  librarySort: string;
  librarySortOrder: boolean;
  libraryCoverInfo: string;
  closeAskIgnored: boolean;
}

export const useConfigStore = defineStore(
  'config',
  () => {
    const config: Ref<Config> = ref({
      theme: 'system',
      defaultClose: '1',
      defaultHome: '0',
      defaultLanguage: 'system',
      homeBackground: '',
      libraryShow: '0',
      librarySort: '0',
      librarySortOrder: false,
      libraryCoverInfo: '0',
      closeAskIgnored: true,
    });
    const setConfig = (setValue: Config) => {
      config.value = setValue;
    };
    return { config, setConfig };
  },
  {
    persist: true,
  }
);
