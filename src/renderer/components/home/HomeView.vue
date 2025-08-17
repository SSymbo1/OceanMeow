<script lang="ts" setup>
  import { Ref, ref, h, watch, nextTick, onMounted } from 'vue';
  import { menu } from '@/renderer/assets/json/home_menu.json';
  import {
    HomeOutlined,
    InboxOutlined,
    SettingOutlined,
    LinkOutlined,
  } from '@ant-design/icons-vue';
  import { useRouter } from 'vue-router';
  import { useAccountStore } from '@/renderer/pinia/store/account';
  import SelectInstallPathModal from '@/renderer/components/component/SelectInstallPathModal.vue';
  import SelectAccountModal from '@/renderer/components/component/SelectAccountModal.vue';
  import { useSteamStore } from '@/renderer/pinia/store/steam';
  import { SteamAccount } from '@/type/electron/entity';
  import { ItemType } from 'ant-design-vue';
  import { useConfigStore } from '@/renderer/pinia/store/config';

  const router = useRouter();
  const selectedKeys = ref<string[]>(['0']);
  const menuItems: Ref<ItemType[]> = ref([]);
  const collapsed = ref<boolean>(true);
  const iconMap: any = {
    HomeOutlined,
    InboxOutlined,
    SettingOutlined,
    LinkOutlined,
  };
  menuItems.value = menu.map((item) => ({
    key: item.key,
    label: item.label,
    title: item.name,
    route: item.route,
    icon: () => h(iconMap[item.icon as keyof typeof iconMap]),
  }));
  const installPathModel: Ref<any> = ref(null);
  const accountModel: Ref<any> = ref(null);
  const accountName = ref('Guest');
  const accountAvator = ref('');

  const handleMenuClick = (key: any) => {
    router.push(menu[Number(key.key)].route);
  };

  const libraryAccountSelected = (account: SteamAccount) => {
    useAccountStore().setAccount({
      steam_id: account.steamId,
      login_name: account.accountName,
      account_name: account.personaName,
      avatar: account.avator,
    });
    updateAccountInfo();
  };

  const steamInstalPathLocatedSuccess = async () => {
    await appBaseDataInit();
  };

  const appBaseDataInit = async () => {
    await nextTick();
    if (useSteamStore().steam.installPath === '') {
      await installPathModel.value?.openAndWait();
    }
    const currentAccount = useAccountStore().account;
    const isEmptyAccountStore = Object.values(currentAccount).every((v) => v === '');
    if (isEmptyAccountStore) {
      await accountModel.value?.openAndWait();
    }
    updateAccountInfo();
  };

  const updateAccountInfo = () => {
    accountAvator.value = useAccountStore().account.avatar;
    accountName.value = useAccountStore().account.account_name;
  };

  watch(
    () => useSteamStore().steam.installPath,
    async (newPath, oldPath) => {
      if (newPath !== oldPath) {
        await appBaseDataInit();
      }
    },
    { immediate: true }
  );
  watch(
    () => useAccountStore().account,
    (newAccount, oldAccount) => {
      if (newAccount.steam_id !== oldAccount.steam_id) {
        updateAccountInfo();
      }
    }
  );
  onMounted(() => {
    let routerName = '';
    selectedKeys.value[0] = useConfigStore().config.defaultHome;
    if (useConfigStore().config.defaultHome === '0') {
      routerName = 'Welcome';
    } else if (useConfigStore().config.defaultHome === '1') {
      routerName = 'Library';
    } else if (useConfigStore().config.defaultHome === '2') {
      routerName = 'Setting';
    } else {
      routerName = 'About';
    }
    router.push({ name: routerName });
  });
</script>

<template>
  <a-layout class="h-full flxe-1">
    <a-layout-sider v-model:collapsed="collapsed" class="min-h-full" collapsible>
      <div class="flex items-center p-4 transition-all mt-2.5">
        <div class="relative w-12 rounded-full overflow-hidden border-2 flex-shrink-0">
          <a-avatar
            :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${accountAvator}`"
            :size="43"
          />
        </div>
        <div
          class="ml-3 text-white font-medium overflow-hidden transition-all duration-300 ease-in-out"
          :class="collapsed ? 'w-0' : 'w-auto'"
        >
          {{ accountName }}
        </div>
      </div>
      <div class="border-t border-gray/50 my-1"></div>
      <a-menu
        v-model:selected-keys="selectedKeys"
        theme="dark"
        mode="inline"
        :items="menuItems"
        @click="handleMenuClick"
      >
      </a-menu>
    </a-layout-sider>
    <a-layout class="flex-1 h-full">
      <a-layout-content class="h-full overflow-hidden">
        <RouterView v-slot="{ Component }">
          <Transition name="animate" mode="out-in">
            <KeepAlive>
              <component :is="Component" />
            </KeepAlive>
          </Transition>
        </RouterView>
      </a-layout-content>
    </a-layout>
  </a-layout>
  <SelectInstallPathModal ref="installPathModel" @success="steamInstalPathLocatedSuccess" />
  <SelectAccountModal ref="accountModel" @account="libraryAccountSelected" />
</template>

<style scoped>
  .animate-enter-active {
    transition:
      opacity 0.28s ease,
      transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .animate-enter-from {
    opacity: 0;
    transform: translateY(12px) scale(0.99);
  }

  .animate-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s cubic-bezier(0.55, 0.085, 0.68, 0.53);
  }

  .animate-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.99);
  }
</style>
