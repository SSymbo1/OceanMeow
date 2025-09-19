<script lang="ts" setup>
  import { onActivated, ref, computed, watch, onDeactivated } from 'vue';
  import { useRoute } from 'vue-router';
  import logo from '@/renderer/assets/icon/logo.svg';
  import ant from '@/renderer/assets/icon/ant.svg';
  import ts from '@/renderer/assets/icon/typescript.svg';
  import vite from '@/renderer/assets/icon/vite.svg';
  import vue from '@/renderer/assets/icon/vue.svg';
  import el from '@/renderer/assets/icon/electron.svg';

  const transitionDirection = ref('');
  const selectedKeys = ref<string[]>(['0']);
  const collapseKey = ref<string[]>(['0']);
  const prevView = ref(selectedKeys.value[0]);
  const route = useRoute();
  const projName = __PROJECT_NAME__;
  const projVersion = __PROJECT_VERSION__;
  const dependencies = __DEPENDENCIES__;
  const viewKey = computed(() => {
    return selectedKeys.value[0];
  });

  watch(selectedKeys, (newVal, oldVal) => {
    if (oldVal[0] === '0' && newVal[0] === '1') {
      transitionDirection.value = 'left';
    } else if (oldVal[0] === '1' && newVal[0] === '0') {
      transitionDirection.value = 'right';
    }
    prevView.value = oldVal[0];
  });
  onActivated(() => {});
  onDeactivated(() => {
    selectedKeys.value = ['0'];
  });
</script>

<template>
  <a-layout class="flex h-full w-full">
    <a-layout-content class="flex flex-col h-full">
      <div class="flex items-center w-full sticky top-0 z-10">
        <a-menu
          :key="route.fullPath"
          v-model:selected-keys="selectedKeys"
          mode="horizontal"
          class="w-full"
        >
          <a-menu-item key="0">
            <span class="inline-flex items-center">
              <QuestionCircleOutlined />
              <span class="ml-2">关于</span>
            </span>
          </a-menu-item>
          <a-menu-item key="1">
            <span class="inline-flex items-center">
              <BranchesOutlined />
              <span class="ml-2">依赖</span>
            </span>
          </a-menu-item>
        </a-menu>
      </div>
      <transition :name="transitionDirection ? 'slide-' + transitionDirection : ''" mode="out-in">
        <div :key="viewKey" class="flex-1 flex overflow-y-auto">
          <div v-if="selectedKeys[0] === '0'" class="flex-1 py-4">
            <div class="h-30 flex flex-row px-4 justify-between">
              <div class="flex flex-row items-center gap-4">
                <img :src="logo" class="w-20" />
                <div class="flex flex-col gap-1">
                  <div class="text-2xl font-bold">{{ projName }}</div>
                  <div class="text-1xl font-bold">{{ projVersion }} for Windows</div>
                  <div class="text-1xl font-bold">MIT License</div>
                  <div>https://github.com/SSymbo1</div>
                </div>
              </div>
              <div class="flex flex-row items-center gap-4">
                <img :src="ant" class="w-20" />
                <div class="flex flex-col gap-1">
                  <div class="text-2xl font-bold">Ant Design Vue</div>
                  <div class="text-1xl font-bold">4.2.6</div>
                  <div class="text-1xl font-bold">MIT License</div>
                  <div>https://antdv.com</div>
                </div>
              </div>
            </div>
            <a-divider orientation="left">构建</a-divider>
            <div class="flex flex-row gap-3 h-40 mt-3 px-4">
              <a-card hoverable class="w-30">
                <div class="flex flex-col gap-2 items-center justify-center">
                  <img :src="el" class="w-15" />
                  <div class="text-1xl font-bold">Electron</div>
                </div>
              </a-card>
              <a-card hoverable class="w-30">
                <div class="flex flex-col gap-2 items-center justify-center">
                  <img :src="vite" class="w-15" />
                  <div class="text-1xl font-bold">Vite</div>
                </div>
              </a-card>
              <a-card hoverable class="w-30">
                <div class="flex flex-col gap-2 items-center justify-center">
                  <img :src="vue" class="w-15" />
                  <div class="text-1xl font-bold">Vue</div>
                </div>
              </a-card>
              <a-card hoverable class="w-30">
                <div class="flex flex-col gap-2 items-center justify-center">
                  <img :src="ts" class="w-15" />
                  <div class="text-1xl font-bold">TypeScript</div>
                </div>
              </a-card>
            </div>
            <a-divider orientation="left">信息</a-divider>
            <div class="flex flex-col px-4">
              <a-collapse v-model:active-key="collapseKey" accordion>
                <a-collapse-panel key="0" header="项目">
                  <div class="flex flex-col gap-2">
                    <div class="flex flex-row justify-between items-center">
                      <span>项目仓库</span>
                      <a-button class="!inline-flex !items-center">
                        <template #icon>
                          <ExportOutlined />
                        </template>
                        <span>跳转</span>
                      </a-button>
                    </div>
                    <div class="flex flex-row justify-between">
                      <span>更新日志</span>
                      <a-button class="!inline-flex !items-center">
                        <template #icon>
                          <ExportOutlined />
                        </template>
                        <span>跳转</span>
                      </a-button>
                    </div>
                    <div class="flex flex-row justify-between">
                      <span>检查更新</span>
                      <a-button class="!inline-flex !items-center">
                        <template #icon>
                          <SearchOutlined />
                        </template>
                        <span>检查</span>
                      </a-button>
                    </div>
                  </div>
                </a-collapse-panel>
                <a-collapse-panel key="1" header="许可证"></a-collapse-panel>
                <a-collapse-panel key="2" header="声明"></a-collapse-panel>
              </a-collapse>
            </div>
          </div>
          <div v-if="selectedKeys[0] === '1'" class="flex-1 px-4 py-4">
            <div class="text-2xl font-bold mb-4">
              依赖({{ Object.keys(dependencies).length }}项)
            </div>
            <a-timeline>
              <a-timeline-item v-for="(value, key, index) in dependencies" :key="index"
                ><div class="flex flex-row justify-between">
                  <span>{{ key }}</span>
                  <span>{{ value }}</span>
                </div></a-timeline-item
              >
              <a-timeline-item>
                <template #dot>
                  <SmileOutlined />
                </template>
              </a-timeline-item>
            </a-timeline>
          </div>
        </div>
      </transition>
    </a-layout-content>
  </a-layout>
</template>

<style scoped>
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: all 0.2s cubic-bezier(0.55, 0, 0.1, 1);
  }

  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(50px);
  }

  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(-50px);
  }

  .slide-right-enter-from {
    opacity: 0;
    transform: translateX(-50px);
  }

  .slide-right-leave-to {
    opacity: 0;
    transform: translateX(50px);
  }
  :global(.ant-timeline .ant-timeline-item-head) {
    background-color: #f5f5f5 !important;
  }
</style>
