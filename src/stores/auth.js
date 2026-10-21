import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { STORAGE_KEYS, USER_ROLES } from '@/constants';

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

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || 'null'),
    token: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null,
    loading: false,
    profileLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userId: (state) => state.user?.id || null,
    userRole: (state) => (state.user?.role || USER_ROLES.USER).toLowerCase(),
    isAdmin: (state) => (state.user?.role || '').toLowerCase() === USER_ROLES.ADMIN,
    isUser: (state) => (state.user?.role || '').toLowerCase() === USER_ROLES.USER,
    userEmail: (state) => state.user?.email || '',
    userName: (state) => state.user?.name || state.user?.username || state.user?.email?.split('@')[0] || 'User',
    userAge: (state) => state.user?.age ?? null,
    isVerified: (state) => !!state.user?.isVerified,
    twoFactorEnabled: (state) => !!state.user?.twoFactorEnabled,
    userAvatar: (state) => state.user?.avatar || '',
    userCreatedAt: (state) => state.user?.createdAt || null,
    userUpdatedAt: (state) => state.user?.updatedAt || null,
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.login(credentials);
        
        // Extract token
        const token = response?.data?.token;
        
        if (token) {
          this.token = token;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        }

        // Fetch fresh full profile with role from /auth/profile
        await this.fetchProfile();

        return response;
      } catch (err) {
        const data = err.response?.data;
        let rawMsg = data?.message || data?.error || err.message || 'Login failed';
        if (typeof rawMsg === 'object' && rawMsg !== null) {
          rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
        }
        this.error = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
        const errorObj = new Error(this.error);
        errorObj.response = err.response;
        errorObj.isUnverified = this.error.toLowerCase().includes('verify your email');
        throw errorObj;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        // POST /auth/register with { name, email, password }
        const response = await authService.register(userData);
        return response;
      } catch (err) {
        const data = err.response?.data;
        let rawMsg = data?.message || data?.error || err.message || 'Registration failed';
        if (typeof rawMsg === 'object' && rawMsg !== null) {
          rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
        }
        this.error = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
        const errorObj = new Error(this.error);
        errorObj.response = err.response;
        throw errorObj;
      } finally {
        this.loading = false;
      }
    },

    async setAuthData({ token, user }) {
      if (token) {
        this.token = token;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);

        if (!user) {
          const payload = decodeJwt(token);
          if (payload) {
            user = {
              id: payload.sub || payload.id,
              email: payload.email,
              role: (payload.role || USER_ROLES.USER).toLowerCase(),
              name: payload.name || payload.username || (payload.email ? payload.email.split('@')[0] : 'User'),
            };
          }
        }
      }

      if (user) {
        this.user = user;
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      }

      if (token) {
        try {
          await this.fetchProfile();
        } catch (e) {
          // If profile fetch fails, user object from OAuth / token payload is still preserved
          console.warn('OAuth profile fetch error, keeping payload profile', e);
        }
      }
    },

    async fetchProfile() {
      if (!this.token) return null;
      
      this.profileLoading = true;
      try {
        const response = await authService.getProfile();
        // Handle varying backend response formats ({ result: true, data: { ... } } or direct user obj)
        let profileData = null;
        if (response && typeof response === 'object') {
          if (response.data && typeof response.data === 'object') {
            profileData = response.data;
          } else {
            profileData = response;
          }
        }
        
        if (profileData) {
          this.user = profileData;
          localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(profileData));
        }
        console.log(profileData);
        return profileData;
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        // If profile fetch fails due to 401, logout
        if (err.response?.status === 401) {
          this.logout();
        }
        throw err;
      } finally {
        this.profileLoading = false;
      }
    },

    async updateProfile(data) {
      this.loading = true;
      try {
        let response;
        try {
          response = await authService.updateProfile?.(data);
        } catch (e) {
          console.warn('API updateProfile failed or not implemented:', e);
        }
        if (response?.data) {
          this.user = { ...this.user, ...response.data };
        } else {
          this.user = { ...this.user, ...data };
        }
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(this.user));
        return this.user;
      } finally {
        this.loading = false;
      }
    },

    async uploadAvatar(fileOrFormData) {
      let formData = fileOrFormData;
      if (fileOrFormData instanceof File) {
        formData = new FormData();
        formData.append('avatar', fileOrFormData);
      }
      const response = await authService.uploadAvatar(formData);
      await this.fetchProfile();
      return response;
    },

    async deleteAvatar() {
      const response = await authService.deleteAvatar();
      await this.fetchProfile();
      return response;
    },

    async setup2FA() {
      const response = await authService.setup2FA();
      // Returns { result: true, data: { secret, qrCode } }
      return response?.data || response;
    },

    // Called after login when the backend requires 2FA (returns requires2FA: true + tempToken)
    async verifyLoginTOTP(tempToken, code) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.verifyLoginTOTP(tempToken, code);
        // Backend returns { access_token } or similar after successful 2FA
        const token =
          response?.access_token ||
          response?.token ||
          response?.data?.access_token ||
          response?.data?.token;
        if (token) {
          this.token = token;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        }
        await this.fetchProfile();
        return response;
      } catch (err) {
        const data = err.response?.data;
        let rawMsg = data?.message || data?.error || err.message || '2FA verification failed';
        if (typeof rawMsg === 'object' && rawMsg !== null) {
          rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
        }
        this.error = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
        const errorObj = new Error(this.error);
        errorObj.response = err.response;
        throw errorObj;
      } finally {
        this.loading = false;
      }
    },

    async verify2FA(token) {
      const response = await authService.verify2FA(token);
      // After successful verify, refresh profile so twoFactorEnabled reflects true
      await this.fetchProfile();
      return response?.data || response;
    },

    async disable2FA(token) {
      const response = await authService.disable2FA(token);
      // After disabling, refresh profile
      await this.fetchProfile();
      return response?.data || response;
    },

    logout() {
      this.user = null;
      this.token = null;
      this.error = null;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    },
  },
});
