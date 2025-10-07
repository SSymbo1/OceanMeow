import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('@/renderer/components/view/home/WelcomeView.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/renderer/components/view/about/AboutView.vue'),
  },
  {
    path: '/library/:scroll?',
    name: 'Library',
    component: () => import('@/renderer/components/view/library/LibraryView.vue'),
  },
  {
    path: '/setting/:subSetting?',
    name: 'Setting',
    component: () => import('@/renderer/components/view/setting/SettingView.vue'),
  },
  {
    path: '/game/:appID',
    name: 'Game',
    component: () => import('@/renderer/components/view/library/GameView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
