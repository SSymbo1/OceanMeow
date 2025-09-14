import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';

interface Config {
  theme: string;
  defaultClose: string;
  defaultHome: string;
  defaultLanguage: string;
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
      theme: '2',
      defaultClose: '1',
      defaultHome: '0',
      defaultLanguage: '2',
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
