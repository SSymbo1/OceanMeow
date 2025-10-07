<script setup lang="ts">
  import { steamStore } from '@/renderer/pinia/store/steam';
  import { ref } from 'vue';
  import { buildLoadProtocolUrl } from '@/renderer/util/url';
  import AccountSelectModal from '../../modal/AccountSelectModal.vue';

  const selectAccountModal = ref<InstanceType<typeof AccountSelectModal> | null>(null);

  const selectAccount = async () => {
    if (selectAccountModal.value) {
      await selectAccountModal.value.openModal();
    }
  };
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-row items-center">
      <!-- 头像 -->
      <a-avatar v-if="!steamStore().avatar" :size="80">
        <template #icon><UserOutlined /></template>
      </a-avatar>
      <a-avatar
        v-else
        :src="buildLoadProtocolUrl(steamStore().installPath, steamStore().avatar)"
        :size="80"
      />
      <!-- 信息区 -->
      <div class="font-bold">
        <a-space direction="vertical" :size="8">
          <!-- 昵称 -->
          <div class="flex items-center gap-2">
            <span class="min-w-[4.5rem] text-right">昵称:</span>
            <span>{{ !steamStore().name ? '未知' : steamStore().name }}</span>
          </div>
          <!-- 账户名 -->
          <div class="flex items-center gap-2">
            <span class="min-w-[4.5rem] text-right">账户名:</span>
            <span>{{ !steamStore().account ? '未知' : steamStore().account }}</span>
          </div>
          <!-- SteamID -->
          <div class="flex items-center gap-2">
            <span class="min-w-[4.5rem] text-right">SteamID:</span>
            <span>{{ !steamStore().accountId ? '未知' : steamStore().accountId }}</span>
          </div>
        </a-space>
      </div>
    </div>
    <!-- 切换用户按钮 -->
    <a-button
      class="!inline-flex !items-center !justify-center mt-1.5"
      type="primary"
      shape="round"
      @click="selectAccount"
    >
      <template #icon><UserSwitchOutlined /></template>
      <span>切换用户</span>
    </a-button>
    <AccountSelectModal ref="selectAccountModal" />
  </div>
</template>

<style scoped></style>
