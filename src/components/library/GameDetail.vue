<script lang="ts" setup>
import { useSteamStore } from '@/pinia/store/steam';
import { PictureOutlined, SaveOutlined, FieldTimeOutlined, ScissorOutlined } from '@ant-design/icons-vue'
import { ScreenDetail } from '@/type/electron/entity';
import { onMounted, ref, Ref } from 'vue';
import { useRoute } from 'vue-router';
import back from '@/assets/icon/back.svg'
import { useAccountStore } from '@/pinia/store/account';

interface Cover {
    hero: string
    logo: string
    name: string
    time: string
}
const cover: Ref<Cover> = ref({ hero: '', logo: '', name: '', time: '' });
const appID = ref('');
const keyword: Ref<string> = ref('');
const screenshorts: Ref<ScreenDetail[]> = ref([]);
const totalScreen = ref(0);
const screenschortsLoading = ref(false);
const firstTotalQuery = ref(true);
const selectedKeys = ref<string[]>(['0']);
const screenCheckList = ref([]);
const route = useRoute();

const appDetailSearch = async (model: string, keywords?: string) => {
    if (model === 'screenshort') {
        screenschortsLoading.value = true
        screenshorts.value = await window.electronAPI.queryScreenshotDetail(
            useAccountStore().account.steam_id,
            appID.value,
            keywords
        )
        if (firstTotalQuery.value) {
            totalScreen.value = screenshorts.value.length
            firstTotalQuery.value = false
        }
        setTimeout(() => {
            screenschortsLoading.value = false
        }, 1000)
    } else {

    }
}

const reviewScreenshot = (screenID: number) => {
    console.log(screenID)
}

onMounted(async () => {
    appID.value = route.params.appID as string
    cover.value = JSON.parse(route.query.cover as string)
    await appDetailSearch('screenshort')
})
</script>

<template>
    <a-layout-content class="flex flex-col h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden">
        <div class="w-full h-1/2 relative">
            <span class="absolute top-4 left-4 z-10 flex items-center space-x-2
                    bg-black/20 hover:bg-black/40 px-3 py-1 rounded-md text-white
                    cursor-pointer transition-all duration-200 ease-out
                    hover:scale-105" @click="$router.back()">
                <img class="w-6 h-6" :src="back" />
                <span>返回</span>
            </span>
            <img class="w-full h-full object-cover"
                :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${cover.hero}`" />
            <img v-if="cover.logo && !cover.logo.endsWith('/undefined')"
                class="absolute bottom-4 right-4 max-w-[30%] h-auto"
                :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${cover.logo}`" />
            <div v-else class="absolute bottom-4 right-4 text-gray-950 text-5xl font-semibold">
                {{ cover.name }}
            </div>
        </div>
        <div class="flex items-center w-full px-4 bg-white sticky top-0 z-30">
            <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal">
                <a-menu-item key="0">
                    <span class="inline-flex items-center">
                        <ScissorOutlined />
                        <span class="ml-2">截图</span>
                    </span>
                </a-menu-item>
                <a-menu-item key="1">
                    <span class="inline-flex items-center">
                        <SaveOutlined />
                        <span class="ml-2">存档</span>
                    </span>
                </a-menu-item>
            </a-menu>
            <div class="flex items-center gap-5 ml-auto">
                <a-date-picker v-model:value="keyword" :bordered="false" placeholder="按日期检索"
                    @change="(_: any, dateString: string) => appDetailSearch('screenshort', dateString)"
                    format="YYYY-MM-DD" />
                <div class="flex items-center gap-2">
                    <PictureOutlined class="text-xl" />
                    <div class="flex flex-col text-xs leading-none">
                        <span>截图总数</span>
                        <span>{{ totalScreen }}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <FieldTimeOutlined class="text-xl" />
                    <div class="flex flex-col text-xs leading-none">
                        <span>游玩时间</span>
                        <span>{{ `${cover.time}h` }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-1 w-full">
            <div v-if="selectedKeys[0] === '0'">
                <div class="flex-1 overflow-y-auto p-2">
                    <a-checkbox-group v-model:value="screenCheckList" v-if="screenshorts.length !== 0">
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            <div v-for="(screen, index) in screenshorts" :key="index" class="relative cursor-pointer
                                        rounded-lg shadow-sm
                                        hover:shadow-xl hover:scale-105
                                        transition-all duration-200 ease-out"
                                @click="reviewScreenshot(screen.screenIndex)">
                                <img class="w-full aspect-video object-cover rounded-lg shadow-sm"
                                    :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${screen.screenThumb.replace(/\\/g, '/')}`"
                                    :alt="`游戏截图 ${index + 1}`" />
                                <a-checkbox :value="screen.screenIndex" class="!absolute top-2 left-2" />
                            </div>
                        </div>
                    </a-checkbox-group>
                    <div v-else-if="!screenschortsLoading"
                        class="flex justify-center items-center h-full text-gray-500">
                        暂无截图数据
                    </div>
                    <div v-else class="flex justify-center items-center h-full">
                        <a-spin size="large" />
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="flex-1 flex justify-center items-center text-gray-500">
                    存档功能尚未实现
                </div>
            </div>
        </div>
    </a-layout-content>
</template>

<style scoped></style>