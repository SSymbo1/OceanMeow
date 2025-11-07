<script setup lang="ts">
  import type { ScreenDetail } from '@/type/electron/entity';
  import type { ItemType } from 'ant-design-vue';
  import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface';
  import { computed, ref, h, Ref } from 'vue';
  import {
    PlusSquareOutlined,
    UploadOutlined,
    ShareAltOutlined,
    FileImageOutlined,
  } from '@ant-design/icons-vue';
  import { App } from 'ant-design-vue';
  import emptyIcon from '@/renderer/assets/icon/empty.svg';
  import ScreenshotCard from '../card/ScreenshotCard.vue';
  import menu from '@/renderer/assets/json/screenshot_click_menu.json';
  import ScreenshotDetailModal from '../../modal/ScreenshotDetailModal.vue';
  import ScreenshotShareModal from '../../modal/ScreenshotShareModal.vue';
  import ScreenshotDumpModal from '../../modal/ScreenshotDumpModal.vue';
  import { steamStore } from '@/renderer/pinia/store/steam';

  const props = defineProps<{
    loading: boolean;
    screenshots: ScreenDetail[];
    keywords: string;
    scroller: any;
  }>();
  const iconMap = {
    PlusSquareOutlined,
    UploadOutlined,
    ShareAltOutlined,
    FileImageOutlined,
  };
  const { message } = App.useApp();
  const screenshotDetailModal = ref<InstanceType<typeof ScreenshotDetailModal> | null>(null);
  const screenshotShareModal = ref<InstanceType<typeof ScreenshotShareModal> | null>(null);
  const screenshotDumpModal = ref<InstanceType<typeof ScreenshotDumpModal> | null>(null);
  const screenshotCards: Ref<any[]> = ref([]);
  const checkList: Ref<number[]> = ref([]);
  const rightClickItem = ref<ScreenDetail | null>(null);
  // 动态计算菜单项目数组中第一个元素
  const menuItems = computed<ItemType[]>(() => {
    const isAllSelected = checkList.value.length === props.screenshots.length;
    const updatedMenu = menu.menu.map((item, index) => {
      if (index === 0) {
        return {
          key: isAllSelected ? 'deselect' : 'select',
          label: isAllSelected ? '取消全选' : '全选',
          title: isAllSelected ? '取消全选' : '全选',
          icon: () => h(iconMap[item.icon as keyof typeof iconMap]),
        };
      }
      return {
        key: item.key,
        label: item.label,
        title: item.name,
        icon: () => h(iconMap[item.icon as keyof typeof iconMap]),
      };
    });
    return updatedMenu;
  });

  // 按日期分组
  const groupedScreenshots = computed(() => {
    return props.screenshots.reduce(
      (acc, item) => {
        const date = item.creation.split(' ')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      },
      {} as Record<string, ScreenDetail[]>
    );
  });

  // 处理卡片选中
  const handleScreenshotCardCheck = (index: number, checked: boolean) => {
    if (checked) {
      checkList.value.push(index);
    } else {
      const idx = checkList.value.indexOf(index);
      checkList.value.splice(idx, 1);
    }
    console.log('checkList:', checkList.value);
  };

  // 卡片右键菜单
  const handleScreenshotRightClick = async ({ key }: MenuInfo) => {
    if (key === 'select') {
      checkList.value = [];
      checkList.value = props.screenshots.map((s) => s.screenIndex);
    } else if (key === 'deselect') {
      checkList.value = [];
    } else if (key === 'backup') {
      const screenIndex = rightClickItem.value?.screenIndex?.toString();
      if (screenshotDumpModal.value && screenIndex) {
        await screenshotDumpModal.value.openModal(
          rightClickItem.value?.appId as string,
          steamStore().accountId,
          rightClickItem.value?.appName as string,
          rightClickItem.value?.appLocalized as string,
          [screenIndex]
        );
      }
    } else if (key === 'share') {
      const screenIndex = rightClickItem.value?.screenIndex?.toString();
      if (screenshotShareModal.value && screenIndex) {
        await screenshotShareModal.value.openModal(rightClickItem.value?.appId as string, [
          screenIndex,
        ]);
      }
    } else if (key === 'detail') {
      if (screenshotDetailModal.value) {
        await screenshotDetailModal.value.openModal(rightClickItem.value as ScreenDetail);
      }
    }
    rightClickItem.value = null;
  };

  const shareScreenshots = async () => {
    if (checkList.value.length === 0) {
      message.warning('请先选择需要分享的截图!');
    } else if (screenshotShareModal.value && checkList.value.length !== 0) {
      await screenshotShareModal.value.openModal(props.screenshots[0].appId, [
        ...checkList.value.map(String),
      ]);
    }
  };

  const dumpScreenshots = async () => {
    if (checkList.value.length === 0) {
      message.warning('请先选择需要导出的截图!');
    } else if (screenshotDumpModal.value && checkList.value.length !== 0) {
      await screenshotDumpModal.value.openModal(
        props.screenshots[0].appId,
        steamStore().accountId,
        props.screenshots[0].appName,
        props.screenshots[0].appLocalized,
        [...checkList.value.map(String)]
      );
    }
  };
</script>

<template>
  <div>
    <!-- 骨架屏加载 -->
    <div
      v-if="loading"
      class="px-4 py-2 grid gap-4 justify-items-center"
      style="grid-template-columns: repeat(auto-fill, minmax(148px, 1fr))"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="w-[148px] h-[100px] bg-gray-200 rounded-lg animate-pulse"
      ></div>
    </div>
    <!-- 具体截图详情 -->
    <div v-else>
      <div v-if="screenshots.length !== 0">
        <div v-for="(items, date) in groupedScreenshots" :key="date">
          <a-divider orientation="left">{{ date }}</a-divider>
          <div
            class="px-4 py-2 grid gap-4 justify-items-center"
            style="grid-template-columns: repeat(auto-fill, minmax(148px, 1fr))"
          >
            <!-- 右键菜单 -->
            <a-dropdown
              v-for="(item, index) in items"
              :key="index"
              :trigger="['contextmenu']"
              @open-change="(visible: boolean) => visible && (rightClickItem = item)"
            >
              <ScreenshotCard
                ref="screenshotCards"
                :card="item"
                :checked="checkList.includes(item.screenIndex)"
                @update:checked="handleScreenshotCardCheck"
              />
              <template #overlay>
                <a-menu :items="menuItems" @click="handleScreenshotRightClick" />
              </template>
            </a-dropdown>
          </div>
        </div>
      </div>
      <!-- 空截图占位 -->
      <div v-else class="px-4 py-2">
        <a-empty
          :image="emptyIcon"
          :image-style="{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }"
        >
          <template #description>
            <div v-if="keywords">{{ `没有“${keywords}” 日期的截图` }}</div>
            <div v-else>{{ `未检索到截图` }}</div>
            <div class="mt-1">
              {{ `受限于从本地库中检索，您可能需要重新启动Steam客户端以获取最新库存信息。` }}
            </div>
          </template>
        </a-empty>
      </div>
      <!-- 浮动按钮容器 -->
      <a-float-button-group v-if="screenshots.length !== 0" shape="circle">
        <a-float-button @click="dumpScreenshots">
          <template #icon>
            <span class="flex items-center justify-center w-full h-full">
              <FileSyncOutlined />
            </span>
          </template>
        </a-float-button>
        <a-float-button @click="shareScreenshots">
          <template #icon>
            <span class="flex items-center justify-center w-full h-full">
              <ShareAltOutlined />
            </span>
          </template>
        </a-float-button>
        <a-back-top :target="() => scroller" />
      </a-float-button-group>
    </div>
    <ScreenshotDetailModal ref="screenshotDetailModal" />
    <ScreenshotShareModal ref="screenshotShareModal" />
    <ScreenshotDumpModal
      ref="screenshotDumpModal"
      @success="
        () => {
          message.success('截图导出成功');
        }
      "
    />
  </div>
</template>

<style scoped></style>
