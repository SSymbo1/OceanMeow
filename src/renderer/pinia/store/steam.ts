import { defineStore } from 'pinia';

// 渲染进程中涉及Steam信息的store
export const steamStore = defineStore('steam', {
  state: () => ({
    installPath: '',
    accountId: '',
    avatar: '',
    account: '',
    name: '',
  }),
  persist: true,
});
