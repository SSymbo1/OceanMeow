<script lang="ts" setup>
import { SteamAccount } from '@/type/electron/entity/'
import { useSteamStore } from '@/pinia/store/steam'
import { onMounted, Ref, ref } from 'vue'
import userIcon from '@/assets/icon/user.svg'

const visiable = ref(false)
const accountList: Ref<SteamAccount[]> = ref([])
const scroller: Ref<any> = ref(null)
const resolvePromise = ref<(() => void) | null>(null)
const emit = defineEmits(['account'])

const collectSteamAccount = async () => {
    const accounts = await window.electronAPI.collectAccountData(useSteamStore().steam.installPath)
    if (accounts.length !== 0) {
        accountList.value = accounts
    }
}

const selectLibraryAccount = (account: SteamAccount) => {
    emit('account', account)
    visiable.value = !visiable.value
    finish()
}

const openAndWait = (): Promise<void> => {
    return new Promise<void>((resolve) => {
        visiable.value = true
        resolvePromise.value = resolve
    })
}

const finish = () => {
    if (resolvePromise.value) {
        resolvePromise.value()
        resolvePromise.value = null
    }
}

onMounted(async () => {
    await collectSteamAccount()
})

defineExpose({
    openAndWait
})
</script>

<template>
    <a-modal :open="visiable" centered title="请选择用户" :footer="null" :closable="false">
        <div class="min-h-75 min-w-100 flex flex-row gap-7 items-center">
            <div v-if="accountList.length === 0" class="mx-auto">
                <a-empty :image="userIcon" :image-style="{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }">
                    <template #description>
                        <div>没有发现在Steam上登录过的用户</div>
                        <div>检查配置的Steam安装路径或在Steam上登录一个账号</div>
                    </template>
                </a-empty>
            </div>
            <div v-else ref="scroller"
                class="min-h-60 flex px-2 py-4 flex-row gap-4 overflow-x-auto whitespace-nowrap">
                <div v-for="(user, index) in accountList" :key="index" class="flex-shrink-0">
                    <a-card @click="selectLibraryAccount(user)" hoverable
                        class="w-35 h-55 flex flex-col items-center justify-center transition-all duration-300 ease-in-out hover:-translate-y-2">
                        <template #cover>
                            <div class="border-2 border-gray-500 rounded-md">
                                <a-avatar :size="100" shape="square"
                                    :src="`load://${useSteamStore().steam.installPath.replace(/\\/g, '/')}${user.avator}`" />
                            </div>
                        </template>
                        <a-card-meta>
                            <template #description>
                                <div class="flex flex-col items-center">
                                    <div class="text-black font-bold">{{ user.personaName }}</div>
                                    <div>账户名称:</div>
                                    <div>{{ user.accountName }}</div>
                                </div>
                            </template>
                        </a-card-meta>
                    </a-card>
                </div>
            </div>
        </div>
    </a-modal>
</template>

<style scoped></style>