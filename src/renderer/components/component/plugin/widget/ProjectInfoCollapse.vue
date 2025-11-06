<script setup lang="ts">
  import { ref } from 'vue';

  const collapseKey = ref<string[]>(['0']);
  const license = __LICENSE_TEXT__;
  const disclaimer = __DISCLAIMER_TEXT__;
  const projectHome = __HOME_PAGE__;
  const releaseHome = __RELEASE_PAGE__;

  const browserRouteTo = (url: string) => {
    window.electronAPI.openURLWithBrowser(url);
  };
</script>

<template>
  <a-collapse v-model:active-key="collapseKey" accordion>
    <a-collapse-panel key="0" header="项目">
      <div class="flex flex-col gap-2">
        <div class="flex flex-row justify-between items-center">
          <span>项目仓库</span>
          <a-button class="!inline-flex !items-center" @click="browserRouteTo(projectHome)">
            <template #icon>
              <ExportOutlined />
            </template>
            <span>跳转</span>
          </a-button>
        </div>
        <div class="flex flex-row justify-between items-center">
          <span>更新日志</span>
          <a-button class="!inline-flex !items-center" @click="browserRouteTo(releaseHome)">
            <template #icon>
              <ExportOutlined />
            </template>
            <span>跳转</span>
          </a-button>
        </div>
        <div class="flex flex-row justify-between">
          <span>检查更新</span>
          <a-button class="!inline-flex !items-center" @click="browserRouteTo(releaseHome)">
            <template #icon>
              <SearchOutlined />
            </template>
            <span>检查</span>
          </a-button>
        </div>
      </div>
    </a-collapse-panel>
    <a-collapse-panel key="1" header="许可证">
      <a-textarea v-model:value="license" auto-size readonly class="!border-none" />
    </a-collapse-panel>
    <a-collapse-panel key="2" header="免责声明">
      <a-textarea v-model:value="disclaimer" auto-size readonly class="!border-none" />
    </a-collapse-panel>
  </a-collapse>
</template>

<style scoped></style>
