import { createApp } from 'vue'
import router from '@/router/main'
import pinia from '@/pinia/main'
import App from './App.vue'
import Antd from 'ant-design-vue';
import '@/assets/css/tailwind.css'
import 'ant-design-vue/dist/reset.css';

const app = createApp(App)
app.use(Antd)
app.use(router)
app.use(pinia)
app.mount('#app')

window.addEventListener('mouseup', (e) => {
    if (e.button === 3 || e.button === 4) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}, true)
window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
}, true);