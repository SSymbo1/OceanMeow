<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { configStore } from '@/renderer/pinia/store/config';
  import HomeSideMenu from '../../component/plugin/widget/HomeSideMenu.vue';
  import RouteBackground from '../../component/plugin/layout/RouteBackground.vue';

  const router = useRouter();
  const collapsed = ref<boolean>(true);
  const sideSelected = ref<string>('welcome');
  const { state, forceTheme } = defineProps<{
    state: boolean;
    forceTheme: 'light' | 'dark';
  }>();

  onMounted(() => {
    if (state) {
      router.push({ name: configStore().defaultHome });
    } else {
      console.log('应用加载失败');
    }
  });
</script>

<template>
  <!-- app为ant全局挂载点使得message这种对象自动消费 -->
  <a-app class="h-full w-full">
    <a-layout class="h-full w-full">
      <!-- 应用侧边垂直导航菜单 -->
      <a-layout-sider
        v-model:collapsed="collapsed"
        collapsible
        class="min-h-full"
        :class="forceTheme === 'dark' ? '!bg-[#141414]' : '!bg-[#ffffff]'"
      >
        <HomeSideMenu :collapsed="collapsed" :selected="sideSelected" />
      </a-layout-sider>
      <a-layout class="flex-1 h-full">
        <!-- 应用路由界面 -->
        <a-layout-content class="flex-1 h-full">
          <RouteBackground class="flex-1 h-auto overflow-auto">
            <RouterView v-slot="{ Component }">
              <Transition name="animate" mode="out-in">
                <component :is="Component" />
              </Transition>
            </RouterView>
          </RouteBackground>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-app>
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
