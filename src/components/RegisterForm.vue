<template>
  <div class="auth-card">
    <!-- Header -->
    <div class="auth-header">
      <div class="brand-pill register-pill">
        <span class="pulse-dot green"></span>
        <span>NEW REGISTRATION</span>
      </div>
      <h2 class="form-title">Join BigBike Store</h2>
      <p class="form-subtitle">Create your rider account &amp; unlock the garage</p>
    </div>

    <!-- ══════ REGISTER FORM ══════ -->
    <form @submit.prevent="handleRegister" class="auth-form" novalidate>
      <!-- Google OAuth Button -->
      <button type="button" class="google-oauth-btn" @click="handleGoogleLogin">
        <svg class="google-icon-svg" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Sign up with Google</span>
      </button>

      <div class="auth-divider">
        <span>or fill details manually</span>
      </div>

      <!-- Full Name -->
      <div class="form-group">
        <label for="reg-name">Full Name</label>
        <div class="input-group" :class="{ 'is-error': rt.name && re.name, 'is-valid': rt.name && !re.name && rf.name }">
          <span class="input-icon">
            <i class="bi bi-person"></i>
          </span>
          <input
            id="reg-name"
            v-model="rf.name"
            type="text"
            placeholder="e.g. Alex Johnson"
            :disabled="regLoading"
            autocomplete="name"
            @blur="rTouch('name')"
            @input="rt.name && rValidateField('name')"
          />
        </div>
        <transition name="fade-slide">
          <span v-if="rt.name && re.name" class="error-msg">
            <i class="bi bi-exclamation-circle error-icon"></i>
            {{ re.name }}
          </span>
        </transition>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="reg-email">Email Address</label>
        <div class="input-group" :class="{ 'is-error': rt.email && re.email, 'is-valid': rt.email && !re.email && rf.email }">
          <span class="input-icon">
            <i class="bi bi-envelope"></i>
          </span>
          <input
            id="reg-email"
            v-model="rf.email"
            type="email"
            placeholder="rider@example.com"
            :disabled="regLoading"
            autocomplete="email"
            @blur="rTouch('email')"
            @input="rt.email && rValidateField('email')"
          />
        </div>
        <transition name="fade-slide">
          <span v-if="rt.email && re.email" class="error-msg">
            <i class="bi bi-exclamation-circle error-icon"></i>
            {{ re.email }}
          </span>
        </transition>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="reg-password">Password</label>
        <div class="input-group" :class="{ 'is-error': rt.password && re.password, 'is-valid': rt.password && !re.password && rf.password }">
          <span class="input-icon">
            <i class="bi bi-lock"></i>
          </span>
          <input
            id="reg-password"
            v-model="rf.password"
            :type="showRegPw ? 'text' : 'password'"
            placeholder="Create a strong password"
            :disabled="regLoading"
            autocomplete="new-password"
            @blur="rTouch('password')"
            @input="rt.password && rValidateField('password')"
          />
          <button type="button" class="visibility-btn" @click="showRegPw = !showRegPw" tabindex="-1">
            <i :class="showRegPw ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <!-- Password Strength Bar -->
        <div v-if="rf.password" class="strength-bar-wrap">
          <div class="strength-bar">
            <div class="strength-fill" :class="pwStrengthClass" :style="{ width: pwStrengthPct + '%' }"></div>
          </div>
          <span class="strength-label" :class="pwStrengthClass">{{ pwStrengthLabel }}</span>
        </div>
        <transition name="fade-slide">
          <span v-if="rt.password && re.password" class="error-msg">
            <i class="bi bi-exclamation-circle error-icon"></i>
            {{ re.password }}
          </span>
        </transition>
      </div>

      <!-- Terms Notice -->
      <p class="terms-notice">
        By registering you agree to our
        <a href="#" @click.prevent>Terms of Service</a> &amp;
        <a href="#" @click.prevent>Privacy Policy</a>.
      </p>

      <!-- Submit -->
      <button type="submit" class="submit-btn register-btn" :disabled="regLoading">
        <span v-if="regLoading" class="spinner-container">
          <span class="spinner"></span><span>Creating Account...</span>
        </span>
        <span v-else class="btn-text-wrapper">
          <span>Create Rider Account</span>
          <i class="bi bi-arrow-right arrow-icon"></i>
        </span>
      </button>

      <!-- Switch to Login -->
      <p class="switch-hint">
        Already have an account?
        <router-link to="/login" class="switch-link">Sign in instead →</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { useFormValidation } from '@/composables/useFormValidation';
import { validators } from '@/utils/validators';

const emit = defineEmits(['success', 'error']);

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const regLoading = ref(false);
const showRegPw = ref(false);

const rf = reactive({ name: '', email: '', password: '' });

const { errors: re, touched: rt, validate: rValidate, validateField: rValidateField, touch: rTouch } = useFormValidation(rf, {
  name: [
    validators.required('Full name is required'),
    validators.minLength(2, 'Name must be at least 2 characters'),
  ],
  email: [
    validators.required('Email address is required'),
    validators.email('Please enter a valid email address'),
  ],
  password: [
    validators.required('Password is required'),
    validators.minLength(6, 'Password must be at least 6 characters'),
  ],
});

// Password Strength
const pwStrengthScore = computed(() => {
  const p = rf.password;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

const pwStrengthPct = computed(() => (pwStrengthScore.value / 5) * 100);

const pwStrengthLabel = computed(() => {
  const s = pwStrengthScore.value;
  if (s <= 1) return 'Weak password';
  if (s <= 2) return 'Fair password';
  if (s <= 3) return 'Good password';
  return 'Strong password';
});

const pwStrengthClass = computed(() => {
  const s = pwStrengthScore.value;
  if (s <= 1) return 'weak';
  if (s <= 2) return 'fair';
  if (s <= 3) return 'good';
  return 'strong';
});

const handleGoogleLogin = () => {
  const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  window.location.href = `${backendBase}/auth/google`;
};

const handleRegister = async () => {
  if (!rValidate()) {
    toast.warning('Please resolve the highlighted errors.', 'Incomplete Form');
    return;
  }
  regLoading.value = true;
  const userEmail = rf.email;
  try {
    await authStore.register({ name: rf.name, email: rf.email, password: rf.password });
    toast.success('Account created! Please verify your email.', 'Registration Successful');
    emit('success');
    
    // Redirect to verification pending page
    router.push({
      path: '/verify-email',
      query: { email: userEmail },
    });
  } catch (err) {
    const msg = err.message || 'Registration failed. Please try again.';
    toast.error(msg, 'Registration Failed');
    emit('error', err);
  } finally {
    regLoading.value = false;
  }
};
</script>

<style scoped>
/* ── Card ─────────────────────────────────────── */
.auth-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ── Tabs ─────────────────────────────────────── */
.auth-tabs {
  position: relative;
  display: flex;
  gap: 0;
  background: rgba(11, 15, 25, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 4px;
  margin-bottom: 0.85rem;
  overflow: hidden;
}

.tab-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(56, 189, 248, 0.15) 100%);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 10px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.tab-slider.slide-right {
  transform: translateX(100%);
}

.auth-tab {
  flex: 1;
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 0.85rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.auth-tab.active {
  color: #e2e8f0;
}

.tab-icon {
  font-size: 0.95rem;
}

/* ── Header ───────────────────────────────────── */
.auth-header {
  margin-bottom: 0.85rem;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 0.35rem;
}

.register-pill {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.35);
  color: #34d399;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.pulse-dot.green {
  background: #34d399;
  box-shadow: 0 0 6px #34d399;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.2rem 0;
  letter-spacing: -0.02em;
}

.form-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

/* ── Google OAuth Button ───────────────────────── */
.google-oauth-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #0f182c;
  border: 1px solid #1e2c47;
  color: #f8fafc;
  padding: 0.68rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.16s ease;
  margin-top: 0.5rem;
}

.google-oauth-btn:hover {
  background: #17243e;
  border-color: #2b3d63;
  transform: translateY(-1px);
}

.google-icon-svg {
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
}

/* ── Divider ──────────────────────────────────── */
.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.25rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #1a2844;
}

.auth-divider span {
  padding: 0 0.85rem;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 400;
}

/* ── Form Inputs ──────────────────────────────── */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.83rem;
  font-weight: 600;
  color: #cbd5e1;
  letter-spacing: 0.01em;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: #0b1325;
  border: 1px solid #1a2844;
  border-radius: 8px;
  transition: all 0.16s ease;
}

.input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.input-group.is-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.input-group.is-valid {
  border-color: #10b981;
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.85rem;
  color: #64748b;
  font-size: 0.95rem;
}

.input-group input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f8fafc;
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.6rem 0.5rem 0.6rem 0;
  min-width: 0;
}

.input-group input::placeholder {
  color: #475569;
}

.visibility-btn {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 0 0.85rem;
  cursor: pointer;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.visibility-btn:hover {
  color: #cbd5e1;
}

.error-msg {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: #fb7185;
}

.error-icon {
  font-size: 0.78rem;
}

/* ── Password Strength Bar ────────────────────── */
.strength-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.2rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-fill.weak {
  background: #f43f5e;
}

.strength-fill.fair {
  background: #f59e0b;
}

.strength-fill.good {
  background: #38bdf8;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-label {
  font-size: 0.72rem;
  font-weight: 600;
}

.strength-label.weak {
  color: #fb7185;
}

.strength-label.fair {
  color: #fbbf24;
}

.strength-label.good {
  color: #38bdf8;
}

.strength-label.strong {
  color: #34d399;
}

/* ── Terms Notice ─────────────────────────────── */
.terms-notice {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
}

.terms-notice a {
  color: #38bdf8;
  text-decoration: none;
}

.terms-notice a:hover {
  text-decoration: underline;
}

/* ── Submit Button ────────────────────────────── */
.submit-btn {
  width: 100%;
  margin-top: 0.35rem;
  padding: 0.76rem 1.25rem;
  background: #3b82f6;
  color: #0b1325;
  border: none;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.16s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.btn-text-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.arrow-icon {
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) .arrow-icon {
  transform: translateX(3px);
}

.spinner-container {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.spinner {
  width: 17px;
  height: 17px;
  border: 2.5px solid rgba(11, 19, 37, 0.3);
  border-top-color: #0b1325;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Switch Hint ──────────────────────────────── */
.switch-hint {
  text-align: center;
  font-size: 0.84rem;
  color: #8c9cb0;
  margin: 0.5rem 0 0 0;
}

.switch-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.16s ease;
}

.switch-link:hover {
  color: #60a5fa;
  text-decoration: underline;
}

/* ── Transitions ──────────────────────────────── */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
