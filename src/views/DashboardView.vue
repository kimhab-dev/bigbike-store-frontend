<template>
  <div class="dashboard-page">
    <!-- Loading State while fetching profile if not loaded -->
    <div v-if="authStore.profileLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading admin permissions...</p>
    </div>

    <!-- Admin Dashboard View with full sidebar layout -->
    <AdminDashboard v-else-if="authStore.isAdmin" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import AdminDashboard from '@/components/dashboard/AdminDashboard.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

onMounted(async () => {
  // Ensure profile with role is fetched from /auth/profile
  if (!authStore.user || !authStore.user.role) {
    try {
      await authStore.fetchProfile();
    } catch (e) {
      // Ignored
    }
  }

  // Redirect if not admin
  if (!authStore.isAdmin) {
    toast.warning('Access restricted to administrators.', 'Unauthorized');
    router.replace('/');
  }
});
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 65px);
  background-color: #070a13;
  color: #f8fafc;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #1e293b;
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

