<script setup lang="ts">
  import { PictureOutlined, ShoppingOutlined, FieldTimeOutlined } from '@ant-design/icons-vue';
  import HomeStatisticsCard from '../../component/plugin/card/HomeStatisticsCard.vue';
  import { onMounted, ref } from 'vue';
  import { homeStatistics } from '@/renderer/hook/statistics';
  import { localTimeState } from '@/renderer/util/time';
  import { buildLoadProtocolUrl } from '@/renderer/util/url';
  import { steamStore } from '@/renderer/pinia/store/steam';
  import { statisticTemplate } from '@/renderer/assets/json/home_message.json';

  const statistics = ref({
    totalGames: 0,
    totalScreenshots: 0,
    totalHoursPlayed: 0,
    heroPictures: [] as string[],
    appNames: [] as string[],
  });
  const greating = ref('');
  const current = ref(0);
  const template = ref(statisticTemplate);

  onMounted(async () => {
    statistics.value = await homeStatistics();
    greating.value = localTimeState();
  });
</script>

<template>
  <div class="h-full w-full">
    <div class="px-5 py-5 text-2xl font-bold">{{ greating }}</div>
    <div class="px-5 py-2">
      <a-carousel autoplay :after-change="(index: number) => (current = index)">
        <div v-for="(picture, index) in statistics.heroPictures" :key="index">
          <img
            class="w-full h-full object-cover"
            :src="buildLoadProtocolUrl(steamStore().installPath, picture)"
            alt=""
          />
        </div>
      </a-carousel>
      <div class="mt-1 text-center">
        {{ template[current].replace('{name}', statistics.appNames[current]) }}
      </div>
    </div>
    <div class="flex flex-row gap-5 px-5 py-2 justify-center">
      <HomeStatisticsCard
        :value="statistics.totalGames"
        title="游戏（个）"
        :icon="ShoppingOutlined"
        class="h-30 w-50"
      />
      <HomeStatisticsCard
        :value="statistics.totalScreenshots"
        title="截图（张）"
        :icon="PictureOutlined"
        class="h-30 w-50"
      />
      <HomeStatisticsCard
        :value="statistics.totalHoursPlayed"
        title="游戏时长（h）"
        :icon="FieldTimeOutlined"
        class="h-30 w-50"
      />
    </div>
    <a-float-button-group trigger="hover" shape="circle">
      <template #icon>
        <DownloadOutlined />
      </template>
      <a-float-button>
        <template #icon>
          <SaveOutlined />
        </template>
      </a-float-button>
      <a-float-button>
        <template #icon>
          <ScissorOutlined />
        </template>
      </a-float-button>
    </a-float-button-group>
  </div>
</template>

<style scoped>
  :deep(.slick-slide) {
    text-align: center;
    height: 160px;
    line-height: 160px;
    background: #364d79;
    overflow: hidden;
    object-fit: cover;
  }
</style>
