import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import Impressum from '../pages/Impressum'
import Datenschutz from '../pages/Datenschutz'
import AdminPage from '../pages/AdminPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import ResetPasswordPage from '../pages/ResetPasswordPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/impressum', component: Impressum },
    { path: '/datenschutz', component: Datenschutz },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/reset-password', name: 'reset-password', component: ResetPasswordPage },
    { path: '/admin', name: 'admin', component: AdminPage, meta: { requiresAuth: true } },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  try {
    if ((await fetch('/api/auth/session')).ok) return true
  } catch {
    // Redirect to login when the session endpoint is unavailable.
  }
  return { name: 'login', query: { redirect: to.fullPath } }
})

export default router
