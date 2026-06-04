import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Impressum from '../pages/Impressum'
import Datenschutz from '../pages/Datenschutz'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/impressum', component: Impressum },
    { path: '/datenschutz', component: Datenschutz },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
