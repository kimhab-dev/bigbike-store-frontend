export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    AVATAR: '/auth/avatar',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification-email',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    FORGOT_PASSWORD: '/auth/forgot-password-request',
    RESET_PASSWORD: '/auth/reset-password',
    TWO_FA_SETUP: '/auth/2fa/setup',
    TWO_FA_VERIFY: '/auth/2fa/verify',
    TWO_FA_DISABLE: '/auth/2fa/disable',
  },
  BIKES: {
    LIST: '/bikes',
    DETAIL: (id) => `/bikes/${id}`,
  },
  PRODUCTS: {
    LIST: '/products',
    MY: '/products/my',
    CREATE: '/products',
    IMAGE: (productId) => `/products/${productId}/image`,
    DETAIL: (productId) => `/products/${productId}`,
    STOCK: (productId) => `/products/${productId}/stock`,
  },
  ORDERS: {
    LIST: '/orders',
    MY: '/orders/my',
    DETAIL: (orderId) => `/orders/${orderId}`,
  },
  USERS: {
    LIST: '/users',
    DETAIL: (userId) => `/users/${userId}`,
  },
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};
