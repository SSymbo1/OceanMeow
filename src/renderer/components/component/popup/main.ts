import '@/renderer/assets/css/tailwind.css';
import App from './App.vue';
import { preventBrowserBackEvent } from '@/renderer/hook/browser';
import { createApp } from 'vue';

createApp(App).mount('#app');
preventBrowserBackEvent();
