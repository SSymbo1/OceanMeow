<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import { QuestionCircleOutlined, BranchesOutlined } from '@ant-design/icons-vue';
  import menu from '@/renderer/assets/json/about_menu.json';
  import TopNavigationMenu from '../../component/plugin/widget/TopNavigationMenu.vue';
  import SubViewTransition from '../../component/plugin/layout/SubViewTransition.vue';
  import AboutSubView from './AboutSubView.vue';
  import DependencySubView from './DependencySubView.vue';

  // 导航菜单栏图标组件映射
  const iconMap = {
    QuestionCircleOutlined,
    BranchesOutlined,
  };
  // 子页面组件映射，键为导航菜单栏的key值
  const componentMap: Record<string, any> = {
    About: AboutSubView,
    Depend: DependencySubView,
  };
  // 导航菜单栏默认选中界面
  const pageIndex = ref(['About']);
  // 记录上一次和当前选中的菜单索引
  const lastIdx = ref(0);
  const currIdx = ref(0);
  // 根据导航菜单栏的key值获取对应的索引
  const keyIndex = Object.fromEntries(menu.menu.map((subMenu, i) => [subMenu.key, i]));
  // 根据索引确定子页面动画切换方向
  const slideDirection = computed(() => (currIdx.value > lastIdx.value ? 'left' : 'right'));
  // 当前显示的子页面组件
  const currentComponent = computed(() => componentMap[pageIndex.value[0]]);

  // 导航菜单栏选择事件
  const onMenuSelect = (index: string) => {
    lastIdx.value = currIdx.value;
    currIdx.value = keyIndex[index];
    pageIndex.value = [index];
  };

  onMounted(() => {});
</script>

<template>
  <div class="h-full w-full">
    <div class="h-full w-full flex flex-col">
      <!-- 导航栏 -->
      <TopNavigationMenu
        v-model:selected-keys="pageIndex"
        class="h-11 flex-shrink-0"
        :icon-component="iconMap"
        :config="menu.menu"
        @select="onMenuSelect"
      />
      <!-- 内容区：占满剩余高度 -->
      <div class="flex-1 overflow-hidden">
        <SubViewTransition :direction="slideDirection">
          <component :is="currentComponent" :key="pageIndex[0]" />
        </SubViewTransition>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
