import '@/renderer/assets/css/tailwind.css';
import App from './App.vue';
import { createApp } from 'vue';

const app = createApp(App);
app.mount('#app');

window.addEventListener(
  'mouseup',
  (e) => {
    if (e.button === 3 || e.button === 4) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  },
  true
);

window.addEventListener(
  'keydown',
  (e) => {
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  },
  true
);

document.addEventListener(
  'selectstart',
  (e: Event) => {
    e.preventDefault();
  },
  true
);
