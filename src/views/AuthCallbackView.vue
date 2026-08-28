<template>
  <div class="callback-page">
    <div class="glow-orb"></div>
    <div class="callback-card">
      <div v-if="loading" class="state-block">
        <div class="spinner"></div>
        <h2>Authenticating with Google...</h2>
        <p class="state-desc">Please wait while we sync your rider credentials.</p>
      </div>

      <div v-else-if="error" class="state-block">
        <div class="error-icon-ring">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2>Authentication Failed</h2>
        <p class="state-desc">{{ error }}</p>
        <button class="back-btn" @click="router.push('/login')">Return to Sign In</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    // 1. Check query parameters (?token=... &data=...)
    let token = route.query.token || route.query.access_token;
    let rawData = route.query.data || route.query.user;
    let user = null;

    if (rawData) {
      try {
        user = typeof rawData === 'string' ? JSON.parse(decodeURIComponent(rawData)) : rawData;
        if (user.result) user = user.result;
      } catch (e) {
        // Ignored
      }
    }

    // 2. Check hash (#token=... or #access_token=...)
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      token = hashParams.get('token') || hashParams.get('access_token');
    }

    if (token) {
      await authStore.setAuthData({ token, user });
      toast.success('Signed in with Google successfully!', 'Google Authorization');
      
      setTimeout(() => {
        if (authStore.isAdmin) {
          router.replace('/dashboard');
        } else {
          router.replace('/');
        }
      }, 500);
    } else {
      error.value = 'No authorization token received from Google OAuth.';
      loading.value = false;
    }
  } catch (err) {
    error.value = err.message || 'Failed to complete Google authentication.';
    loading.value = false;
  }
});
</script>

<style scoped>
.callback-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #070a12;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
}

.glow-orb {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, #0284c7 0%, transparent 70%);
  filter: blur(120px);
  opacity: 0.25;
}

.callback-card {
  position: relative;
  z-index: 2;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  max-width: 420px;
  width: 100%;
  margin: 0 1.5rem;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(244, 63, 94, 0.12);
  border: 2px solid rgba(251, 113, 133, 0.4);
  color: #fb7185;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon-ring svg {
  width: 28px;
  height: 28px;
}

h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.state-desc {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
}

.back-btn {
  margin-top: 0.5rem;
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}
</style>
