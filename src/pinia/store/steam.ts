import { Ref, ref } from "vue";
import { defineStore } from "pinia";

interface Steam {
    installPath: string;
}

export const useSteamStore = defineStore(
    'steam',
    () => {
        let steam: Ref<Steam> = ref({
            installPath: ''
        })
        const setSteam = (setValue: Steam) => {
            steam.value = setValue;
        }
        return { steam, setSteam }
    }, {
    persist: true
});