<script setup lang="ts">
  import {
    HomeOutlined,
    InboxOutlined,
    SettingOutlined,
    LinkOutlined,
  } from '@ant-design/icons-vue';
  import { menu } from '@/renderer/assets/json/home_menu.json';
  import { ItemType } from 'ant-design-vue';
  import { Ref, ref, h, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { buildLoadProtocolUrl } from '@/renderer/util/url';
  import { steamStore } from '@/renderer/pinia/store/steam';

  const { collapsed } = defineProps<{
    collapsed: boolean;
    selected: string;
  }>();
  const route = useRoute();
  const router = useRouter();
  const iconMap = {
    HomeOutlined,
    InboxOutlined,
    SettingOutlined,
    LinkOutlined,
  };
  const selectedKeys = computed({
    get: () => {
      if (route.name === 'Game') return ['Library'];
      return route.name ? [String(route.name)] : [];
    },
    set: () => {},
  });
  const menuItems: Ref<ItemType[]> = ref([]);
  menuItems.value = menu.map((item) => ({
    key: item.key,
    label: item.label,
    title: item.name,
    route: item.route,
    icon: () => h(iconMap[item.icon as keyof typeof iconMap]),
  }));
</script>

<template>
  <div class="h-full w-full">
    <!-- 用户头像区信息区 -->
    <div class="flex items-center p-4 transition-all mt-2.5">
      <div class="relative w-12 rounded-full overflow-hidden border-2 flex-shrink-0">
        <a-avatar v-if="!steamStore().avatar" :size="43">
          <template #icon><UserOutlined /></template>
        </a-avatar>
        <a-avatar
          v-else
          :src="buildLoadProtocolUrl(steamStore().installPath, steamStore().avatar)"
          :size="43"
        />
      </div>
      <div
        class="ml-3 font-medium overflow-hidden transition-all duration-300 ease-in-out"
        :class="collapsed ? 'max-w-0' : 'max-w-auto'"
      >
        <span v-if="!steamStore().name" class="truncate">{{ `未知` }}</span>
        <span v-else class="truncate">{{ steamStore().name }}</span>
      </div>
    </div>
    <!-- 侧边菜单区域 -->
    <a-menu
      v-model:selected-keys="selectedKeys"
      mode="inline"
      :items="menuItems"
      @click="
        ({ item }: any) => {
          router.push(item.route);
        }
      "
    ></a-menu>
  </div>
</template>

<style scoped></style>
