import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import VerifyEmailView from '@/views/VerifyEmailView.vue';
import AuthCallbackView from '@/views/AuthCallbackView.vue';
import ResetPasswordView from '@/views/ResetPasswordView.vue';
import DashboardView from '@/views/DashboardView.vue';
import ProfileView from '@/views/ProfileView.vue';
import ProductDetailView from '@/views/ProductDetailView.vue';
import MyOrdersView from '@/views/MyOrdersView.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAdmin: false },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true, hideNavbar: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true, hideNavbar: true },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: { hideNavbar: true },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: { hideNavbar: true },
  },
  {
    path: '/auth/reset-password',
    name: 'auth-reset-password',
    component: ResetPasswordView,
    meta: { hideNavbar: true },
  },
  {
    path: '/auth/google/callback',
    name: 'google-callback',
    component: AuthCallbackView,
    meta: { hideNavbar: true },
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: AuthCallbackView,
    meta: { hideNavbar: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, requiresAdmin: true, hideNavbar: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: ProductDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: '/orders',
    name: 'my-orders',
    component: MyOrdersView,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    return { top: 0, behavior: 'smooth' };
  },
});

// Initial profile load tracker
let isInitialProfileVerified = false;

// Navigation Guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // If user has token, verify fresh profile & role from /auth/profile
  if (authStore.isAuthenticated && (!isInitialProfileVerified || !authStore.user?.role)) {
    try {
      await authStore.fetchProfile();
      isInitialProfileVerified = true;
    } catch (e) {
      console.warn('Navigation guard: Profile verification failed or session expired', e);
    }
  }

  // 1. Unauthenticated users trying to access any protected route -> redirect to login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  // 2. Admin Route Guard: Non-admin users attempting to access admin routes (e.g. /dashboard)
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' };
  }

  // 3. User Route Guard: If a route specifically requires regular user role
  if (to.meta.requiresUser && !authStore.isUser) {
    return { name: 'dashboard' };
  }

  // 4. Guest-Only Route Guard (e.g. /login, /register):
  // Authenticated users are redirected according to their role (admin -> /dashboard, user -> /)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return authStore.isAdmin ? { name: 'dashboard' } : { name: 'home' };
  }

  return true;
});

export default router;
