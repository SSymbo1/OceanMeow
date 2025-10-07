<script setup lang="ts">
  import { ref, Ref } from 'vue';
  import type { SteamAccount } from '@/type/electron/entity';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import { buildLoadProtocolUrl } from '@/renderer/util/url';
  import userIcon from '@/renderer/assets/icon/user.svg';

  const visible = ref(false);
  let resolveVisible: ((val: boolean) => void) | null = null;
  const accountList: Ref<SteamAccount[]> = ref([]);

  const openModal = async (): Promise<boolean> => {
    visible.value = true;
    accountList.value = await window.electronAPI.collectAccountData(steamStore().installPath);
    return new Promise<boolean>((resolve) => {
      resolveVisible = resolve;
    });
  };

  const closeModal = () => {
    visible.value = false;
    resolveVisible?.(false);
  };

  const selectAccount = (account: SteamAccount) => {
    steamStore().account = account.accountName;
    steamStore().name = account.personaName;
    steamStore().avatar = account.avatar;
    steamStore().accountId = account.steamId;
    closeModal();
  };

  defineExpose({
    openModal,
  });
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="选择账号"
    :footer="null"
    :closable="true"
    centered
    @cancel="closeModal"
  >
    <div class="min-h-75 min-w-100 flex flex-row gap-7 items-center">
      <div v-if="accountList.length === 0" class="mx-auto">
        <a-empty
          :image="userIcon"
          :image-style="{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }"
        >
          <template #description>
            <div>{{ `没有发现在Steam上登录过的用户` }}</div>
            <div>{{ `检查配置的Steam安装路径或在Steam上登录一个账号` }}</div>
          </template>
        </a-empty>
      </div>
      <div v-else class="overflow-x-auto whitespace-nowrap px-2 py-4">
        <div class="flex flex-row flex-nowrap gap-4">
          <a-card
            v-for="(user, index) in accountList"
            :key="index"
            hoverable
            class="w-35 h-55 flex flex-col items-center justify-center transition-all duration-300 ease-in-out hover:-translate-y-2"
            @click="selectAccount(user)"
          >
            <template #cover>
              <div class="border-2 border-gray-500 rounded-md">
                <a-avatar
                  :size="100"
                  shape="square"
                  :src="buildLoadProtocolUrl(steamStore().installPath, user.avatar)"
                />
              </div>
            </template>
            <a-card-meta>
              <template #description>
                <div class="flex flex-col items-center">
                  <div class="font-bold">{{ user.personaName }}</div>
                  <div>{{ `账户名称:` }}</div>
                  <div>{{ user.accountName }}</div>
                </div>
              </template>
            </a-card-meta>
          </a-card>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style scoped></style>
