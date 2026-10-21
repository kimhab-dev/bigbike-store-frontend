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
import ShowroomView from '@/views/ShowroomView.vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';

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
    path: '/showroom',
    name: 'showroom',
    component: ShowroomView,
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

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Navigation Guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // 0. Intercept OAuth redirect token (?token=... or #token=...) from Google / OAuth login
  let token = to.query.token || to.query.access_token || to.query.tempToken;
  let rawData = to.query.data || to.query.user;
  let user = null;

  if (!token && to.hash) {
    const hashParams = new URLSearchParams(to.hash.replace(/^#/, ''));
    token = hashParams.get('token') || hashParams.get('access_token') || hashParams.get('tempToken');
    if (!rawData) {
      rawData = hashParams.get('data') || hashParams.get('user');
    }
  }

  let parsedData = null;
  if (rawData) {
    try {
      parsedData = typeof rawData === 'string' ? JSON.parse(decodeURIComponent(rawData)) : rawData;
      if (parsedData?.result && parsedData?.data) {
        parsedData = parsedData.data;
      }
      user = parsedData?.user || (parsedData?.id ? parsedData : null);
    } catch (e) {
      console.warn('Failed to parse OAuth user data:', e);
    }
  }

  // Check if this token is a 2FA temporary token (e.g. admin 2FA verification required)
  const payload = token ? decodeJwt(token) : null;
  const is2FAPending =
    payload?.type === '2fa_pending' ||
    to.query.requiresTwoFactor === 'true' ||
    to.query.requires2FA === 'true' ||
    parsedData?.requiresTwoFactor === true ||
    parsedData?.requires2FA === true ||
    !!to.query.tempToken ||
    !!parsedData?.tempToken;

  if (is2FAPending && (token || parsedData?.tempToken)) {
    const tempToken = parsedData?.tempToken || token;
    const qrCode = parsedData?.twoFa?.qrCode || to.query.qrCode || '';
    const secret = parsedData?.twoFa?.secret || to.query.secret || '';

    // Store pending 2FA data in sessionStorage so LoginForm can render the TOTP step
    sessionStorage.setItem(
      'pending_2fa',
      JSON.stringify({
        tempToken,
        qrCode,
        secret,
      })
    );

    try {
      const toastStore = useToastStore();
      toastStore.info('Two-Factor Authentication is required for your admin account.', 'Admin Verification');
    } catch (e) {
      // Ignored
    }

    return {
      path: '/login',
      query: { twoFactor: 'true' },
      replace: true,
    };
  }

  if (token) {
    await authStore.setAuthData({ token, user });
    isInitialProfileVerified = true;

    try {
      const toastStore = useToastStore();
      toastStore.success('Signed in with Google successfully!', 'Google Authorization');
    } catch (e) {
      // Ignored
    }

    // Clean up query parameters so the JWT token is removed from the browser URL
    const cleanQuery = { ...to.query };
    delete cleanQuery.token;
    delete cleanQuery.access_token;
    delete cleanQuery.tempToken;
    delete cleanQuery.data;
    delete cleanQuery.user;

    let targetPath = to.path;
    if (targetPath.startsWith('/auth/google/callback') || targetPath.startsWith('/auth/callback')) {
      targetPath = authStore.isAdmin ? '/dashboard' : '/';
    }

    return {
      path: targetPath,
      query: cleanQuery,
      hash: '',
      replace: true,
    };
  }

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
