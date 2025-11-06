import { createApp } from 'vue';
import { preventBrowserBackEvent } from '@/renderer/hook/browser';
import router from '@/renderer/router/main';
import pinia from '@/renderer/pinia/main';
import i18n from '@/renderer/i18n/main';
import App from './App.vue';
import '@/renderer/assets/css/tailwind.css';

createApp(App).use(router).use(pinia).use(i18n).mount('#app');
preventBrowserBackEvent();
window.electronAPI.onWindowRoute((path) => {
  router.push(path);
});
