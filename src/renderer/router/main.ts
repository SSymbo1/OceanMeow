import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/renderer/components/home/WelcomeView.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/renderer/components/about/AboutView.vue'),
  },
  {
    path: '/library',
    name: 'Library',
    component: () => import('@/renderer/components/library/LibraryView.vue'),
  },
  {
    path: '/setting',
    name: 'Setting',
    component: () => import('@/renderer/components/setting/SettingView.vue'),
  },
  {
    path: '/game/:appID',
    name: 'Game',
    component: () => import('@/renderer/components/library/GameDetail.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
