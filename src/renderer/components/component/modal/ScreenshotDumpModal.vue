<script lang="ts" setup>
  import { ref, Ref, computed, watch, nextTick } from 'vue';
  import type { Rule } from 'ant-design-vue/es/form';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import { screenDumpFolderType } from '@/renderer/assets/json/option.json';

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
  const visible = ref(false);
  let resolveVisible: ((val: boolean) => void) | null = null;
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
  const dumpScreens: Ref<string[]> = ref([]);
  const config: Ref<any> = ref({});
  const form = ref();
  const emit = defineEmits(['success']);

  const openModal = async (
    appID: string,
    accountID: string,
    appName: string,
    appLocation: string,
    files: string[]
  ): Promise<boolean> => {
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
    visible.value = true;
    return new Promise<boolean>((resolve) => {
      resolveVisible = resolve;
    });
  };

  const closeModal = () => {
    visible.value = false;
    resolveVisible?.(false);
  };

  const dumpScreenshot = async () => {
    try {
      await form.value?.validateFields();
      const result = await window.electronAPI.dumpGameScreen(
        steamStore().installPath,
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
        closeModal();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const selectDumpLocation = async () => {
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
    openModal,
  });
</script>

<template>
  <a-modal
    v-model:open="visible"
    title="截图导出"
    :footer="null"
    :closable="true"
    centered
    @cancel="closeModal"
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
            <a-button type="primary" ghost @click="selectDumpLocation"> {{ `选择位置` }} </a-button>
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
              v-for="(item, index) in screenDumpFolderType"
              :key="index"
              :value="item.value"
              :title="item.title"
              >{{ item.name }}</a-select-option
            >
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
              @click="dumpScreenshot"
            >
              <template #icon>
                <UploadOutlined />
              </template>
              <span>{{ `导出` }}</span>
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<style scoped></style>
