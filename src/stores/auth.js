import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { STORAGE_KEYS, USER_ROLES } from '@/constants';

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
        const token = response?.access_token || response?.token || response?.data?.access_token || response?.data?.token;
        
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
      }
      if (user) {
        this.user = user;
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      }
      if (token) {
        try {
          await this.fetchProfile();
        } catch (e) {
          // If profile fetch fails, user object from OAuth is still preserved
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

    logout() {
      this.user = null;
      this.token = null;
      this.error = null;
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    },
  },
});
