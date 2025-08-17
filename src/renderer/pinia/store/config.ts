import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';

interface Config {
  theme: string;
  defaultHome: string;
  defaultLanguage: string;
  libraryShow: string;
  librarySort: string;
  librarySortOrder: boolean;
  libraryCoverInfo: string;
}

export const useConfigStore = defineStore(
  'config',
  () => {
    const config: Ref<Config> = ref({
      theme: '2',
      defaultHome: '0',
      defaultLanguage: '2',
      libraryShow: '0',
      librarySort: '0',
      librarySortOrder: false,
      libraryCoverInfo: '0',
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
