import { defineStore } from 'pinia';

// 渲染进程中整体应用的配置store
export const configStore = defineStore('config', {
  state: (): {
    theme: string;
    defaultLanguage: string;
    defaultHome: string;
    homeBackground: string;
    closeAskIgnored: boolean;
    closeApplication: string;
  } => ({
    theme: 'system',
    defaultLanguage: 'system',
    defaultHome: 'Welcome',
    homeBackground: '',
    closeAskIgnored: false,
    closeApplication: '0',
  }),
});
