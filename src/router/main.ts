import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'Welcome', component: () => import('@/components/home/Welcome.vue'), meta: { keepAlive: false } },
  { path: '/about', name: 'About', component: () => import('@/components/about/About.vue'), meta: { keepAlive: false } },
  { path: '/library', name: 'Library', component: () => import('@/components/library/Library.vue'), meta: { keepAlive: true } },
  { path: '/setting', name: 'Setting', component: () => import('@/components/setting/Setting.vue'), meta: { keepAlive: false } },
  { path: '/game/:appID', name: 'Game', component: () => import('@/components/library/GameDetail.vue'), meta: { keepAlive: false } }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;