<script setup lang="ts">
  import type { MenuProps, ItemType } from 'ant-design-vue';
  import { computed, h, watch, type Component, ref } from 'vue';
  import { themeCalculate } from '@/renderer/hook/appearance';
  import { configStore } from '@/renderer/pinia/store/config';

  type MenuItem = {
    key: string;
    name: string;
    label: string;
    icon: string;
    route?: string;
  };

  const forceTheme = ref<'light' | 'dark'>('light');
  const emit = defineEmits(['update:selectedKeys', 'select']);

  const props = defineProps<{
    iconComponent: Record<string, Component>;
    config: MenuItem[];
    selectedKeys?: string[];
    screenshorts?: number;
    playTime?: number;
    lastStart?: string;
    totalAchievements?: number;
    completeAchievements?: number;
  }>();

  const selectedKeys = computed({
    get: () => props.selectedKeys ?? [],
    set: (val: string[]) => {
      emit('update:selectedKeys', val);
    },
  });

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    selectedKeys.value = [String(key)];
    emit('select', key);
  };

  const menuItems = computed<ItemType[]>(() =>
    props.config.map((item) => ({
      key: item.key,
      label: item.label,
      title: item.name,
      icon: () => h(props.iconComponent[item.icon as keyof typeof props.iconComponent]),
    }))
  );

  watch(
    () => configStore().theme,
    async (newVal) => {
      forceTheme.value = await themeCalculate(newVal);
    },
    { immediate: true }
  );
</script>

<template>
  <div
    class="flex items-center justify-between w-full sticky top-0 z-10 h-11"
    :class="forceTheme === 'dark' ? 'bg-[#141414]' : 'bg-[#ffffff]'"
  >
    <a-menu
      v-model:selected-keys="selectedKeys"
      mode="horizontal"
      class="w-1/2"
      :items="menuItems"
      @click="handleMenuClick"
    ></a-menu>
    <div v-if="screenshorts || playTime || lastStart" class="flex items-center gap-4 mr-3">
      <div v-if="totalAchievements && completeAchievements" class="flex items-center gap-2">
        <FieldTimeOutlined class="text-xl" />
        <div class="flex flex-col text-xs leading-normal">
          <span>{{ `成就` }}</span>
          <span>{{ `${completeAchievements}/${totalAchievements}` }}</span>
        </div>
      </div>
      <div v-if="screenshorts" class="flex items-center gap-2">
        <PictureOutlined class="text-xl" />
        <div class="flex flex-col text-xs leading-normal">
          <span>{{ `截图总数` }}</span>
          <span>{{ screenshorts }}</span>
        </div>
      </div>
      <div v-if="playTime" class="flex items-center gap-2">
        <FieldTimeOutlined class="text-xl" />
        <div class="flex flex-col text-xs leading-normal">
          <span>{{ `游戏时长` }}</span>
          <span>{{ `${playTime}h` }}</span>
        </div>
      </div>
      <div v-if="lastStart" class="flex items-center gap-2">
        <FieldTimeOutlined class="text-xl" />
        <div class="flex flex-col text-xs leading-normal">
          <span>{{ `最后启动日期` }}</span>
          <span>{{ lastStart }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  :deep(.ant-menu-horizontal) {
    padding: 0 !important;
  }
  :deep(.ant-menu-item) {
    line-height: 44px !important;
  }
</style>
