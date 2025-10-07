import '@/renderer/assets/css/tailwind.css';
import App from './App.vue';
import pinia from '@/renderer/pinia/main';
import { preventBrowserBackEvent } from '@/renderer/hook/browser';
import { createApp } from 'vue';

createApp(App).use(pinia).mount('#app');
preventBrowserBackEvent();
