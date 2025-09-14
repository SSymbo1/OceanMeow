<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import { onActivated, ref, Ref, computed, watch, onDeactivated } from 'vue';
  import { useAccountStore } from '@/renderer/pinia/store/account';
  import { useSteamStore } from '@/renderer/pinia/store/steam';
  import { ApplicationConfig } from '@/type/electron/entity';
  import { SteamAccount } from '@/type/electron/entity';
  import SelectAccountModal from '@/renderer/components/component/modal/SelectAccountModal.vue';
  import SelectInstallPathModal from '@/renderer/components/component/modal/SelectInstallPathModal.vue';
  import { useConfigStore } from '@/renderer/pinia/store/config';

  const accountModel: Ref<any> = ref(null);
  const installPathModel: Ref<any> = ref(null);
  const transitionDirection = ref('');
  const selectedKeys = ref<string[]>(['0']);
  const prevView = ref(selectedKeys.value[0]);
  const steamPath: Ref<string> = ref('');
  const config: Ref<ApplicationConfig> = ref({} as ApplicationConfig);
  const route = useRoute();
  const viewKey = computed(() => {
    return selectedKeys.value[0];
  });

  const libraryAccountSelected = (account: SteamAccount) => {
    useAccountStore().setAccount({
      steam_id: account.steamId,
      login_name: account.accountName,
      account_name: account.personaName,
      avatar: account.avatar,
    });
  };

  const steamInstallPathLocatedSuccess = async () => {
    await openSelectAccountModal();
  };

  const openSelectAccountModal = async () => {
    await accountModel.value?.openAndWait();
  };

  const openSelectInstallPathModal = async () => {
    await installPathModel.value?.openAndWait();
  };

  const selectDumpScreenPath = async () => {
    const userSelectPath = (await window.electronAPI.folderSelector()) ?? '';
    if (userSelectPath) {
      config.value.defaultScreenDumpPath = userSelectPath;
    }
  };

  watch(
    () => Number(selectedKeys.value[0]),
    (newIdx, oldIdx) => {
      if ((oldIdx + 1) % 4 === newIdx) {
        transitionDirection.value = 'left';
      } else {
        transitionDirection.value = 'right';
      }
      prevView.value = String(oldIdx);
    }
  );

  watch(
    () => ({
      theme: config.value.theme,
      defaultHome: config.value.defaultHome,
      defaultClose: config.value.closeApplication,
      defaultLanguage: config.value.defaultLanguage,
      libraryShow: config.value.libraryShow,
      librarySort: config.value.librarySort,
      librarySortOrder: config.value.librarySortOrder,
      libraryCoverInfo: config.value.libraryCoverInfo,
    }),
    (newVals) => {
      useConfigStore().setConfig({
        ...useConfigStore().config,
        theme: newVals.theme,
        defaultClose: newVals.defaultClose,
        defaultHome: newVals.defaultHome,
        defaultLanguage: newVals.defaultLanguage,
        libraryShow: newVals.libraryShow,
        librarySort: newVals.librarySort,
        librarySortOrder: newVals.librarySortOrder,
        libraryCoverInfo: newVals.libraryCoverInfo,
      });
    }
  );

  watch(
    config,
    async () => {
      console.log('config change', config.value.closeApplication);
      await window.electronAPI.writeApplicationConfig({ ...config.value });
    },
    { deep: true }
  );

  onActivated(async () => {
    config.value = await window.electronAPI.readApplicationConfig();
    steamPath.value = useSteamStore().steam.installPath;
  });
  onDeactivated(() => {
    selectedKeys.value = ['0'];
  });
</script>

<template>
  <a-layout class="flex h-full w-full">
    <a-layout-content class="flex flex-col h-full">
      <div class="flex items-center w-full px-2 bg-white sticky top-0 z-10">
        <a-menu :key="route.fullPath" v-model:selected-keys="selectedKeys" mode="horizontal">
          <a-menu-item key="0">
            <span class="inline-flex items-center">
              <AppstoreOutlined />
              <span class="ml-2">基础</span>
            </span>
          </a-menu-item>
          <a-menu-item key="1">
            <span class="inline-flex items-center">
              <InboxOutlined />
              <span class="ml-2">库</span>
            </span>
          </a-menu-item>
          <a-menu-item key="2">
            <span class="inline-flex items-center">
              <PictureOutlined />
              <span class="ml-2">截取</span>
            </span>
          </a-menu-item>
        </a-menu>
      </div>
      <transition :name="transitionDirection ? 'slide-' + transitionDirection : ''" mode="out-in">
        <div :key="viewKey" class="flex-1 flex overflow-y-auto">
          <div v-if="selectedKeys[0] === '0'" class="flex-1 px-3 py-1 overflow-y-aut">
            <div class="flex flex-col">
              <a-divider orientation="left">Steam账户与安装位置</a-divider>
              <div class="flex flex-row justify-start gap-15 ml-10 h-30">
                <div class="flex flex-row items-center gap-4">
                  <img
                    class="w-20"
                    :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${useAccountStore().account.avatar}`"
                  />
                  <div class="flex flex-col gap-1 font-bold">
                    <div class="flex">
                      <span class="w-18">昵称:</span>
                      <span>{{ useAccountStore().account.account_name }}</span>
                    </div>
                    <div class="flex">
                      <span class="w-18">账户名:</span>
                      <span>{{ useAccountStore().account.login_name }}</span>
                    </div>
                    <div class="flex">
                      <span class="w-18">SteamID:</span>
                      <span>{{ useAccountStore().account.steam_id }}</span>
                    </div>
                    <a-button
                      class="!inline-flex !items-center !justify-center mt-1.5"
                      type="primary"
                      shape="round"
                      @click="openSelectAccountModal"
                    >
                      <template #icon>
                        <UserSwitchOutlined />
                      </template>
                      <span>切换用户</span>
                    </a-button>
                  </div>
                </div>
                <div class="flex flex-col gap-2 justify-center font-bold">
                  <div>Steam安装路径</div>
                  <a-input-group compact>
                    <a-input v-model:value="steamPath" readonly style="width: calc(90% - 80px)" />
                    <a-button type="primary" @click="openSelectInstallPathModal">选择路径</a-button>
                  </a-input-group>
                </div>
              </div>
              <a-divider orientation="left">主题</a-divider>
              <a-form
                :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
                :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 66)' }"
                label-align="right"
              >
                <a-form-item label="应用主题">
                  <a-select v-model:value="config.theme">
                    <a-select-option value="0">亮色</a-select-option>
                    <a-select-option value="1">暗色</a-select-option>
                    <a-select-option value="2">跟随系统</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="首页背景" name="dumpPath">
                  <a-space>
                    <a-input v-model:value="config.homeBackground" readonly class="flex-1" />
                    <a-button type="primary" ghost>选择图片</a-button>
                  </a-space>
                </a-form-item>
              </a-form>
              <a-divider orientation="left">应用</a-divider>
              <a-form
                :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
                :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 66)' }"
                label-align="right"
              >
                <a-form-item label="启动后界面">
                  <a-select v-model:value="config.defaultHome">
                    <a-select-option value="0">首页</a-select-option>
                    <a-select-option value="1">库</a-select-option>
                    <a-select-option value="2">设置</a-select-option>
                    <a-select-option value="3">关于</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="语言">
                  <a-select v-model:value="config.defaultLanguage">
                    <a-select-option value="0">简体中文</a-select-option>
                    <a-select-option value="1">English</a-select-option>
                    <a-select-option value="2">跟随系统</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="点击关闭按钮">
                  <a-radio-group v-model:value="config.closeApplication">
                    <a-radio-button value="0">退出应用</a-radio-button>
                    <a-radio-button value="1">最小化至托盘</a-radio-button>
                  </a-radio-group>
                </a-form-item>
              </a-form>
            </div>
          </div>
          <div v-if="selectedKeys[0] === '1'" class="flex-1 px-3 py-1">
            <div class="flex flex-col">
              <a-divider orientation="left">外观</a-divider>
              <a-form
                :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
                :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 66)' }"
                label-align="right"
              >
                <a-form-item label="库展示方式">
                  <a-select v-model:value="config.libraryShow">
                    <a-select-option value="0">宫格式</a-select-option>
                    <a-select-option value="1">列表式</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="库封面信息">
                  <a-select v-model:value="config.libraryCoverInfo">
                    <a-select-option value="0">截图数量</a-select-option>
                    <a-select-option value="1">游戏时间</a-select-option>
                    <a-select-option value="2">最近游玩时间</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="库排序方式">
                  <a-select v-model:value="config.librarySort">
                    <a-select-option value="0">截图数量</a-select-option>
                    <a-select-option value="1">游戏时间</a-select-option>
                    <a-select-option value="2">最近游玩时间</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item label="库排序规则">
                  <a-radio-group v-model:value="config.librarySortOrder">
                    <a-radio-button :value="true">正序</a-radio-button>
                    <a-radio-button :value="false">降序</a-radio-button>
                  </a-radio-group>
                </a-form-item>
                <a-form-item label="截图排序规则">
                  <a-radio-group v-model:value="config.screenSortOrder">
                    <a-radio-button :value="true">正序</a-radio-button>
                    <a-radio-button :value="false">降序</a-radio-button>
                  </a-radio-group>
                </a-form-item>
              </a-form>
              <a-divider orientation="left">截图导出</a-divider>
              <a-form
                ref="form"
                :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
                :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 66)' }"
                label-align="right"
              >
                <a-form-item label="导出路径" name="dumpPath">
                  <a-space>
                    <a-input v-model:value="config.defaultScreenDumpPath" readonly class="flex-1" />
                    <a-button type="primary" ghost @click="selectDumpScreenPath">选择位置</a-button>
                  </a-space>
                </a-form-item>
                <a-form-item label="独立文件夹">
                  <a-switch
                    v-model:checked="config.defaultScreenCreateFolder"
                    checked-children="启用"
                    un-checked-children="禁用"
                  />
                </a-form-item>
                <a-form-item label="按时间分类">
                  <a-switch
                    v-model:checked="config.defaultScreenDateOrdered"
                    checked-children="启用"
                    un-checked-children="禁用"
                /></a-form-item>
                <a-form-item label="文件夹命名">
                  <a-select v-model:value="config.defaultScreenFolderType">
                    <a-select-option
                      value="0"
                      title="文件夹名为游戏的appID，例如命运2的的appID为1085660，则导出文件夹名为1085660"
                      >与Steam截图默认文件夹名保持一致</a-select-option
                    >
                    <a-select-option
                      value="1"
                      title="文件夹名为游戏的原名，例如命运2的原名为Destiny 2，则导出文件夹名为Destiny 2"
                      >与Steam游戏原名保持一致</a-select-option
                    >
                    <a-select-option
                      value="2"
                      title="文件夹名为游戏的本地化名，例如命运2的本地化名为命运2，则导出文件夹名为命运2"
                      >与Steam本地化游戏名保持一致</a-select-option
                    >
                    <a-select-option value="3" title="自定义导出文件夹的名称"
                      >自定义</a-select-option
                    >
                  </a-select>
                </a-form-item>
              </a-form>
              <a-divider orientation="left">存档导出</a-divider>
            </div>
          </div>
          <div v-if="selectedKeys[0] === '2'" class="flex-1 px-3 py-1">
            <div class="flex flex-col">
              <a-divider orientation="left">屏幕截图</a-divider>
            </div>
          </div>
        </div>
      </transition>
    </a-layout-content>
    <SelectInstallPathModal ref="installPathModel" @success="steamInstallPathLocatedSuccess" />
    <SelectAccountModal ref="accountModel" @account="libraryAccountSelected" />
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
</style>
