import { createApp } from 'vue';
import router from '@/website/router/main';
import pinia from '@/website/pinia/main';
import App from './App.vue';
import '@/website/assets/css/tailwind.css';

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');
