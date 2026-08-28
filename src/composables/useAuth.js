import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const authStore = useAuthStore();

  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const loading = computed(() => authStore.loading);
  const error = computed(() => authStore.error);

  const login = async (credentials) => {
    return await authStore.login(credentials);
  };

  const logout = () => {
    authStore.logout();
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
}
