import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
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
});

// Navigation Guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' };
  }

  // If authenticated and user role is not yet loaded, fetch profile
  if (isAuthenticated && (!authStore.user || !authStore.user.role)) {
    try {
      await authStore.fetchProfile();
    } catch (e) {
      // Ignored
    }
  }

  // Prevent regular users from accessing admin-only dashboard
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' };
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return authStore.isAdmin ? { name: 'dashboard' } : { name: 'home' };
  }

  return true;
});

export default router;
