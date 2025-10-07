<script setup lang="ts">
  import ProjectInfo from '../../component/plugin/widget/ProjectInfo.vue';
  import DependencyCard from '../../component/plugin/card/DependencyCard.vue';
  import ProjectInfoCollapse from '../../component/plugin/widget/ProjectInfoCollapse.vue';
  import logo from '@/renderer/assets/icon/logo.svg';
  import ant from '@/renderer/assets/icon/ant.svg';
  import ts from '@/renderer/assets/icon/typescript.svg';
  import vite from '@/renderer/assets/icon/vite.svg';
  import vue from '@/renderer/assets/icon/vue.svg';
  import el from '@/renderer/assets/icon/electron.svg';
  import tailwind from '@/renderer/assets/icon/tailwind.svg';

  const projectName = __PROJECT_NAME__;
  const projectVersion = __PROJECT_VERSION__;
</script>

<template>
  <div class="h-full w-full overflow-y-auto">
    <!-- 页面上层：项目信息和项目组件库信息 -->
    <div class="flex flex-row py-4 justify-around">
      <ProjectInfo
        :logo="logo"
        :name="projectName"
        :version="projectVersion"
        address="https://github.com/SSymbo1"
        license="MIT License"
        platform="Windows"
      />
      <ProjectInfo
        :logo="ant"
        name="Ant Design Vue"
        version="4.2.6"
        address="https://antdv.com"
        license="MIT License"
      />
    </div>
    <!-- 页面中层：项目构建依赖框架/库信息 -->
    <a-divider orientation="left">构建</a-divider>
    <div class="h-40 flex flex-row gap-3 px-4">
      <DependencyCard class="flex-1" :image="el" name="Electron" />
      <DependencyCard class="flex-1" :image="vue" name="Vue" />
      <DependencyCard class="flex-1" :image="vite" name="Vite" />
      <DependencyCard class="flex-1" :image="ts" name="TypeScript" />
      <DependencyCard class="flex-1" :image="tailwind" name="TailwindCSS" />
    </div>
    <!-- 页面下层：项目信息抽屉 -->
    <a-divider orientation="left">项目信息</a-divider>
    <div class="flex-1 px-4 mb-4">
      <ProjectInfoCollapse />
    </div>
  </div>
</template>

<style scoped></style>
