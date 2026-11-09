import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Config from './pages/Config.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/config', component: Config }
  ]
});
