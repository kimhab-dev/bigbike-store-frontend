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
        <i class="fa fa-google google-icon"></i>
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
  gap: 0.65rem;
  padding: 0.6rem 0.85rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: #f1f5f9;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 0.85rem;
}

.google-oauth-btn:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(56, 189, 248, 0.4);
  color: #ffffff;
  transform: translateY(-1px);
}

.google-icon {
  font-size: 1.05rem;
  color: #ea4335;
}

/* ── Divider ──────────────────────────────────── */
.auth-divider {
  display: flex;
  align-items: center;
  margin-bottom: 0.85rem;
  color: #64748b;
  font-size: 0.78rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.auth-divider span {
  padding: 0 0.75rem;
}

/* ── Form Inputs ──────────────────────────────── */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #cbd5e1;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(11, 15, 25, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  transition: all 0.2s ease;
  overflow: hidden;
}

.input-group:focus-within {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
}

.input-group.is-error {
  border-color: #f43f5e;
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15);
}

.input-group.is-valid {
  border-color: rgba(52, 211, 153, 0.5);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.72rem 1.15rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 1px solid rgba(52, 211, 153, 0.4);
  border-radius: 12px;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  margin-top: 0.15rem;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  box-shadow: 0 6px 22px rgba(16, 185, 129, 0.5);
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
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
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Switch Hint ──────────────────────────────── */
.switch-hint {
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0.5rem 0 0 0;
}

.switch-link {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s;
}

.switch-link:hover {
  color: #7dd3fc;
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
