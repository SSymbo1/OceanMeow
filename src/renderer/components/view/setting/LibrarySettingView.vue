<script setup lang="ts">
  import {
    libraryStyle,
    librarySortBy,
    sortOrder,
    isEnable,
    screenDumpFolderType,
  } from '@/renderer/assets/json/option.json';
  import { storeToRefs } from 'pinia';
  import { libraryStore } from '@/renderer/pinia/store/library';
  import { onUnmounted } from 'vue';

  const {
    libraryShow,
    libraryCoverInfo,
    librarySort,
    librarySortOrder,
    screenSortOrder,
    defaultScreenDumpPath,
    defaultScreenCreateFolder,
    defaultScreenDateOrdered,
    defaultScreenFolderType,
  } = storeToRefs(libraryStore());

  // 监听library配置的store变化,将新配置写入配置文件library块
  const unsubscribe = libraryStore().$subscribe(async (_, state) => {
    await window.electronAPI.writeApplicationConfigCustom({
      library: {
        libraryShow: state.libraryShow,
        librarySort: state.librarySort,
        librarySortOrder: state.librarySortOrder,
        screenSortOrder: state.screenSortOrder,
        libraryCoverInfo: state.libraryCoverInfo,
        defaultScreenDumpPath: state.defaultScreenDumpPath,
        defaultScreenCreateFolder: state.defaultScreenCreateFolder,
        defaultScreenDateOrdered: state.defaultScreenDateOrdered,
        defaultScreenFolderType: state.defaultScreenFolderType,
      },
    });
  });

  const selectDumpFolder = async () => {
    const folder = await window.electronAPI.folderSelector();
    if (folder) {
      defaultScreenDumpPath.value = folder.replace(/\\/g, '/');
    }
  };

  onUnmounted(() => {
    unsubscribe();
  });
</script>

<template>
  <div class="h-full w-full overflow-y-auto">
    <a-divider orientation="left">外观</a-divider>
    <a-form
      ref="form"
      :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
      :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 66)' }"
      label-align="right"
    >
      <a-form-item label="库展示方式">
        <a-radio-group v-model:value="libraryShow">
          <a-radio-button v-for="(item, index) in libraryStyle" :key="index" :value="item.value">{{
            item.name
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="库封面信息">
        <a-select v-model:value="libraryCoverInfo">
          <a-select-option
            v-for="(item, index) in librarySortBy"
            :key="index"
            :value="item.value"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
    </a-form>
    <a-divider orientation="left">排序</a-divider>
    <a-form
      ref="form"
      :label-col="{ flex: '0 0 calc(var(--spacing) * 27.5)' }"
      :wrapper-col="{ flex: '0 0 calc(var(--spacing) * 66)' }"
      label-align="right"
    >
      <a-form-item label="库排序方式">
        <a-select v-model:value="librarySort">
          <a-select-option
            v-for="(item, index) in librarySortBy"
            :key="index"
            :value="item.value"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
      <a-form-item label="库排序规则">
        <a-radio-group v-model:value="librarySortOrder">
          <a-radio-button v-for="(item, index) in sortOrder" :key="index" :value="item.value">{{
            item.name
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="截图排序规则">
        <a-radio-group v-model:value="screenSortOrder">
          <a-radio-button v-for="(item, index) in sortOrder" :key="index" :value="item.value">{{
            item.name
          }}</a-radio-button>
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
      <a-form-item label="导出路径">
        <a-space>
          <a-input v-model:value="defaultScreenDumpPath" readonly class="flex-1" />
          <a-button type="primary" ghost @click="selectDumpFolder">选择位置</a-button>
        </a-space>
      </a-form-item>
      <a-form-item label="独立文件夹">
        <a-radio-group v-model:value="defaultScreenCreateFolder">
          <a-radio-button v-for="(item, index) in isEnable" :key="index" :value="item.value">{{
            item.name
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="按时间分类">
        <a-radio-group v-model:value="defaultScreenDateOrdered">
          <a-radio-button v-for="(item, index) in isEnable" :key="index" :value="item.value">{{
            item.name
          }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="文件夹命名">
        <a-select v-model:value="defaultScreenFolderType">
          <a-select-option
            v-for="(item, index) in screenDumpFolderType"
            :key="index"
            :value="item.value"
            :title="item.title"
            >{{ item.name }}</a-select-option
          >
        </a-select>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped></style>
