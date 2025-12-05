import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/auth',
    redirect: '/',
  },
  {
    path: '/tennisstege',
    name: 'tennisstege',
    component: () => import('@/views/TennisstegeView.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard to protect authenticated routes
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    // User is not authenticated, redirect to home
    // Note: According to requirements, redirect handling is solved separately
    next({ name: 'home' })
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    // User is not admin/superuser, redirect to home
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
