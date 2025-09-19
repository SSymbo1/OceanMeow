<script setup lang="ts">
  import { SteamDumpConfig } from '@/main/entity';
  import { computed, nextTick, Ref, ref, watch } from 'vue';
  import type { Rule } from 'ant-design-vue/es/form';
  import { useSteamStore } from '@/renderer/pinia/store/steam';

  interface FormConfig {
    appID: string;
    accountID: string;
    dumpPath: string;
    createFolder: boolean;
    folderType: string;
    folderName: string;
    orderByDate: boolean;
    appName: string;
    appLocation: string;
  }
  const formConfig: Ref<FormConfig> = ref({
    appID: '',
    accountID: '',
    dumpPath: '',
    createFolder: false,
    folderType: '',
    folderName: '',
    orderByDate: false,
    appName: '',
    appLocation: '',
  });
  const rules = computed<Record<string, Rule | Rule[]>>(() => {
    const rule: Record<string, Rule | Rule[]> = {
      dumpPath: [{ required: true, message: '必须选择导出路径!' }],
    };
    if (formConfig.value.createFolder && formConfig.value.folderType === '3') {
      rule.folderName = [
        { required: true, message: '请输入自定义文件夹名称' },
        { max: 50, message: '最多 50 个字符' },
      ];
    }
    return rule;
  });
  const config: Ref<SteamDumpConfig> = ref(new SteamDumpConfig());
  const dumpScreens: Ref<string[]> = ref([]);
  const form = ref();
  const visiable = ref(false);
  const emit = defineEmits(['success']);

  const showDumpOption = async (
    appID: string,
    accountID: string,
    appName: string,
    appLocation: string,
    files: string[]
  ) => {
    dumpScreens.value = files;
    config.value = await window.electronAPI.gameScreenConfig(appID, accountID);
    formConfig.value = {
      appID: appID,
      accountID: accountID,
      dumpPath: config.value.dumpPath,
      createFolder: config.value.createFolder === '1',
      folderType: config.value.folderType,
      folderName: config.value.folderName,
      orderByDate: config.value.orderByDate === '1',
      appName: appName,
      appLocation: appLocation,
    };
    visiable.value = true;
  };

  const dumpScrenshot = async () => {
    try {
      await form.value?.validateFields();
      const result = await window.electronAPI.dumpGameScreen(
        useSteamStore().steam.installPath,
        {
          appID: formConfig.value.appID,
          steamID: formConfig.value.accountID,
          dumpPath: formConfig.value.dumpPath,
          createFolder: formConfig.value.createFolder ? '1' : '0',
          folderType: formConfig.value.folderType,
          folderName: formConfig.value.folderName,
          orderByDate: formConfig.value.orderByDate ? '1' : '0',
          appName: formConfig.value.appName,
          appLocation: formConfig.value.appLocation,
        },
        [...dumpScreens.value]
      );
      if (result) {
        emit('success');
        close();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const selectDumplocation = async () => {
    formConfig.value.dumpPath =
      (await window.electronAPI.folderSelector()) ?? formConfig.value.dumpPath;
  };

  watch(
    () => [formConfig.value.createFolder, formConfig.value.folderType],
    () => {
      nextTick(() => form.value?.clearValidate());
    }
  );

  defineExpose({
    showDumpOption,
  });
</script>

<template>
  <a-modal
    :open="visiable"
    centered
    title="导出"
    :footer="null"
    @cancel="
      () => {
        visiable = false;
      }
    "
  >
    <div class="min-h-80 flex flex-col items-center py-5">
      <a-form
        ref="form"
        :model="formConfig"
        :rules="rules"
        :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
        :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 66)' }"
        label-align="right"
      >
        <a-form-item label="导出路径" name="dumpPath">
          <a-space>
            <a-input v-model:value="formConfig.dumpPath" disabled class="flex-1" />
            <a-button type="primary" ghost @click="selectDumplocation"> 选择位置 </a-button>
          </a-space>
        </a-form-item>
        <a-form-item label="独立文件夹">
          <a-switch
            v-model:checked="formConfig.createFolder"
            checked-children="启用"
            un-checked-children="禁用"
          />
        </a-form-item>
        <a-form-item label="按时间分类">
          <a-switch
            v-model:checked="formConfig.orderByDate"
            checked-children="启用"
            un-checked-children="禁用"
        /></a-form-item>
        <a-form-item v-if="formConfig.createFolder" label="文件夹命名方式">
          <a-select v-model:value="formConfig.folderType">
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
            <a-select-option value="3" title="自定义导出文件夹的名称">自定义</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="formConfig.createFolder && formConfig.folderType === '3'"
          label="自定义名称"
          name="folderName"
        >
          <a-input v-model:value="formConfig.folderName" />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 24 }">
          <div class="flex justify-center">
            <a-button
              class="!inline-flex !items-center"
              type="primary"
              shape="round"
              html-type="submit"
              @click="dumpScrenshot"
            >
              <template #icon>
                <UploadOutlined />
              </template>
              <span>导出</span>
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<style scoped></style>
