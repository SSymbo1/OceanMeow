<script setup lang="ts">
  import type { LibraryDetail, ScreenDetail } from '@/type/electron/entity';
  import { ScissorOutlined, SaveOutlined, CrownOutlined } from '@ant-design/icons-vue';
  import { onMounted, ref, Ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import menu from '@/renderer/assets/json/game_detail_menu.json';
  import SubViewTransition from '../../component/plugin/layout/SubViewTransition.vue';
  import GameDetailBackground from '../../component/plugin/widget/GameDetailBackground.vue';
  import TopNavigationMenu from '../../component/plugin/widget/TopNavigationMenu.vue';
  import GameSaveListScroll from '../../component/plugin/layout/GameSaveListScroll.vue';
  import ScreenshotCardGridScroll from '../../component/plugin/layout/ScreenshotCardGridScroll.vue';
  import AchievementGridScroll from '../../component/plugin/layout/AchievementGridScroll.vue';

  const route = useRoute();
  // 导航菜单栏图标组件映射
  const iconMap = {
    ScissorOutlined,
    SaveOutlined,
    CrownOutlined,
  };
  // 子页面组件映射，键为导航菜单栏的key值
  const componentMap: Record<string, any> = {
    Screenshot: ScreenshotCardGridScroll,
    Save: GameSaveListScroll,
    Achieve: AchievementGridScroll,
  };
  // 导航菜单栏默认选中界面
  const pageIndex = ref(['Screenshot']);
  // 记录上一次和当前选中的菜单索引
  const lastIdx = ref(0);
  const currIdx = ref(0);
  // 根据导航菜单栏的key值获取对应的索引
  const keyIndex = Object.fromEntries(menu.menu.map((subMenu, i) => [subMenu.key, i]));
  // 根据索引确定子页面动画切换方向
  const slideDirection = computed(() => (currIdx.value > lastIdx.value ? 'left' : 'right'));
  // 当前显示的子页面组件
  const currentComponent = computed(() => componentMap[pageIndex.value[0]]);
  const loading = ref(false);
  const gameId = ref('');
  const keywords = ref('');
  const scrollArea = ref();
  const screenshots: Ref<ScreenDetail[]> = ref([]);
  const gameDetail: Ref<LibraryDetail | null> = ref(null);

  // 导航菜单栏选择事件
  const onMenuSelect = (index: string) => {
    lastIdx.value = currIdx.value;
    currIdx.value = keyIndex[index];
    pageIndex.value = [index];
  };

  const screenshotInfoSelector = async () => {
    loading.value = true;
    screenshots.value = await window.electronAPI.queryScreenshotDetail(
      steamStore().accountId,
      gameId.value,
      keywords.value
    );
    setTimeout(() => {
      loading.value = false;
    }, 1500);
  };

  onMounted(async () => {
    gameId.value = route.params.appID as string;
    await screenshotInfoSelector();
    gameDetail.value = (
      await window.electronAPI.queryLibraryDetail(steamStore().accountId, gameId.value)
    )[0];
  });
</script>

<template>
  <div ref="scrollArea" class="flex flex-col min-h-full">
    <!-- 封面图 -->
    <GameDetailBackground
      v-if="gameDetail"
      :hero="gameDetail.appHero"
      :logo="gameDetail.appLogo"
      :name="gameDetail.appName"
      :game="gameId"
    />
    <TopNavigationMenu
      v-model:selected-keys="pageIndex"
      class="h-11 flex-shrink-0"
      :icon-component="iconMap"
      :config="menu.menu"
      :screenshorts="screenshots.length"
      :play-time="gameDetail?.timeHour"
      :last-start="gameDetail?.lastPlay"
      @select="onMenuSelect"
    />
    <div class="flex-1">
      <SubViewTransition :direction="slideDirection">
        <component
          :is="currentComponent"
          :key="pageIndex[0]"
          :loading="loading"
          :screenshots="screenshots"
          keywords=""
          :scroller="scrollArea"
        />
      </SubViewTransition>
    </div>
  </div>
</template>

<style scoped></style>
