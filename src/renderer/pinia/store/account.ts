import { Ref, ref } from 'vue';
import { defineStore } from 'pinia';

interface Account {
  steam_id: string;
  login_name: string;
  account_name: string;
  avatar: string;
}

export const useAccountStore = defineStore(
  'account',
  () => {
    const account: Ref<Account> = ref({
      steam_id: '',
      login_name: '',
      account_name: '',
      avatar: '',
    });
    const setAccount = (setValue: Account) => {
      account.value = setValue;
    };
    return { account, setAccount };
  },
  {
    persist: true,
  }
);
