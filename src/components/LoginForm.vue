<template>
  <div class="auth-card">
    <!-- Header -->
    <div class="auth-header">
      <transition name="header-fade" mode="out-in">
        <div v-if="activeTab === 'login'" key="login-header">
          <div class="brand-pill">
            <span class="pulse-dot"></span>
            <span>MEMBER ACCESS</span>
          </div>
          <h2 class="form-title">Welcome Back, Rider</h2>
          <p class="form-subtitle">Access your garage, orders &amp; telemetry</p>
        </div>
        <div v-else-if="activeTab === 'totp'" key="totp-header">
          <div class="brand-pill totp-pill">
            <span class="pulse-dot cyan"></span>
            <span>2FA VERIFICATION</span>
          </div>
          <h2 class="form-title">Two-Factor Auth</h2>
          <p class="form-subtitle">Enter the 6-digit code from your authenticator app</p>
        </div>
        <div v-else-if="activeTab === 'register'" key="register-header">
          <div class="brand-pill register-pill">
            <span class="pulse-dot green"></span>
            <span>NEW REGISTRATION</span>
          </div>
          <h2 class="form-title">Join BigBike Store</h2>
          <p class="form-subtitle">Create your rider account &amp; unlock the garage</p>
        </div>
        <div v-else key="forgot-header">
          <div class="brand-pill forgot-pill">
            <span class="pulse-dot amber"></span>
            <span>RECOVERY ACCESS</span>
          </div>
          <h2 class="form-title">Reset Password</h2>
          <p class="form-subtitle">We'll send a secure password reset link to your email</p>
        </div>
      </transition>
    </div>

    <!-- ══════ FORGOT PASSWORD FORM ══════ -->
    <transition name="form-slide" mode="out-in">

      <!-- ══════ TOTP 2FA STEP ══════ -->
      <form v-if="activeTab === 'totp'" key="totp-form" @submit.prevent="handleTOTPVerify" class="auth-form" novalidate>

        <!-- QR Code block (only shown when server returns one) -->
        <div v-if="pendingQrCode" class="totp-qr-section">
          <div class="totp-qr-header" @click="showQrCode = !showQrCode">
            <div class="totp-qr-label">
              <i class="fa fa-qrcode"></i>
              <span>First time? Scan QR Code</span>
            </div>
            <i :class="showQrCode ? 'fa fa-chevron-up' : 'fa fa-chevron-down'" class="totp-qr-chevron"></i>
          </div>
          <transition name="qr-expand">
            <div v-if="showQrCode" class="totp-qr-body">
              <p class="totp-qr-inst">Scan this with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP app:</p>
              <div class="totp-qr-img-wrap">
                <img :src="pendingQrCode" alt="2FA QR Code" class="totp-qr-img" />
              </div>
              <p class="totp-qr-done">Done scanning? Enter the code below ↓</p>
            </div>
          </transition>
        </div>

        <!-- Shield icon (shown when no QR) -->
        <div v-else class="totp-shield-wrap">
          <div class="totp-shield">
            <i class="fa fa-shield"></i>
          </div>
          <p class="totp-hint">Open your authenticator app and enter the current code for <strong>BigBike Store</strong>.</p>
        </div>

        <!-- 6-digit OTP input -->
        <div class="form-group">
          <label for="totp-code">6-Digit Authenticator Code</label>
          <div class="input-group" :class="{ 'is-error': totpError }">
            <span class="input-icon">
              <i class="fa fa-key"></i>
            </span>
            <input
              id="totp-code"
              v-model="totpCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="6"
              placeholder="000000"
              class="totp-input"
              :disabled="totpLoading"
              autocomplete="one-time-code"
              @input="totpError = ''; totpCode = totpCode.replace(/\D/g, '').slice(0, 6)"
            />
            <!-- Code length indicator dots -->
            <div class="totp-dots">
              <span v-for="i in 6" :key="i" class="totp-dot" :class="{ filled: totpCode.length >= i }"></span>
            </div>
          </div>
          <transition name="fade-slide">
            <span v-if="totpError" class="error-msg">
              <i class="fa fa-exclamation-circle error-icon"></i>
              {{ totpError }}
            </span>
          </transition>
        </div>

        <!-- Submit -->
        <button type="submit" class="submit-btn" :disabled="totpLoading || totpCode.length !== 6">
          <span v-if="totpLoading" class="spinner-container">
            <span class="spinner"></span><span>Verifying Code...</span>
          </span>
          <span v-else class="btn-text-wrapper">
            <span>Verify &amp; Sign In</span>
            <i class="fa fa-arrow-right arrow-icon"></i>
          </span>
        </button>

        <!-- Back link -->
        <p class="switch-hint">
          Wrong account?
          <button type="button" class="switch-link" @click="cancelTOTP">← Back to Sign In</button>
        </p>
      </form>

      <div v-else-if="activeTab === 'forgot'" key="forgot-form" class="auth-form">
          <div v-if="forgotSuccess" class="forgot-success-box">
          <div class="forgot-success-icon"><i class="fa fa-check"></i></div>
          <h3>Check Your Inbox</h3>
          <p>We've sent password reset instructions to <strong>{{ forgotEmail }}</strong>. Click the link in the email to set a new password.</p>
          <button type="button" class="submit-btn" @click="switchTab('login')">
            Return to Sign In →
          </button>
        </div>

        <form v-else @submit.prevent="handleForgotPassword" novalidate>
          <div class="form-group">
            <label for="forgot-email">Registered Email Address</label>
            <div class="input-group" :class="{ 'is-error': forgotError }">
              <span class="input-icon">
                <i class="fa fa-envelope"></i>
              </span>
              <input
                id="forgot-email"
                v-model="forgotEmail"
                type="email"
                placeholder="rider@example.com"
                :disabled="forgotLoading"
                autocomplete="email"
              />
            </div>
            <span v-if="forgotError" class="error-msg">{{ forgotError }}</span>
          </div>

          <button type="submit" class="submit-btn forgot-btn" :disabled="forgotLoading">
            <span v-if="forgotLoading" class="spinner-container">
              <span class="spinner"></span><span>Sending Reset Link...</span>
            </span>
            <span v-else>Send Reset Instructions</span>
          </button>

          <p class="switch-hint">
            Remembered your password?
            <button type="button" class="switch-link" @click="switchTab('login')">Back to Sign In →</button>
          </p>
        </form>
      </div>

      <!-- ══════ LOGIN FORM ══════ -->
      <form v-else-if="activeTab === 'login'" key="login-form" @submit.prevent="handleLogin" class="auth-form" novalidate>

        <!-- Google OAuth Button -->
        <button type="button" class="google-oauth-btn" @click="handleGoogleLogin">
          <i class="fa fa-google google-icon"></i>
          <span>Continue with Google</span>
        </button>

        <div class="auth-divider">
          <span>or continue with email</span>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="login-email">Email Address</label>
          <div class="input-group" :class="{ 'is-error': lt.email && le.email, 'is-valid': lt.email && !le.email && lf.email }">
            <span class="input-icon">
              <i class="fa fa-envelope"></i>
            </span>
            <input id="login-email" v-model="lf.email" type="email" placeholder="rider@example.com"
              :disabled="loading" autocomplete="email"
              @blur="lTouch('email')" @input="lt.email && lValidateField('email')" />
          </div>
          <transition name="fade-slide">
            <span v-if="lt.email && le.email" class="error-msg">
              <i class="fa fa-exclamation-circle error-icon"></i>
              {{ le.email }}
            </span>
          </transition>
        </div>

        <!-- Password -->
        <div class="form-group">
          <div class="label-row">
            <label for="login-password">Password</label>
            <a href="#forgot" class="forgot-link" @click.prevent="showForgotNotice">Forgot password?</a>
          </div>
          <div class="input-group" :class="{ 'is-error': lt.password && le.password, 'is-valid': lt.password && !le.password && lf.password }">
            <span class="input-icon">
              <i class="fa fa-lock"></i>
            </span>
            <input id="login-password" v-model="lf.password" :type="showLoginPw ? 'text' : 'password'"
              placeholder="Enter your password" :disabled="loading"
              autocomplete="current-password"
              @blur="lTouch('password')" @input="lt.password && lValidateField('password')" />
            <button type="button" class="visibility-btn" @click="showLoginPw = !showLoginPw" tabindex="-1">
              <i :class="showLoginPw ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
            </button>
          </div>
          <transition name="fade-slide">
            <span v-if="lt.password && le.password" class="error-msg">
              <i class="fa fa-exclamation-circle error-icon"></i>
              {{ le.password }}
            </span>
          </transition>
        </div>

        <!-- Remember Me -->
        <div class="form-options">
          <label class="remember-label">
            <input type="checkbox" v-model="rememberMe" />
            <span class="custom-checkbox"></span>
            <span>Remember this session</span>
          </label>
        </div>

        <!-- Submit -->
        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner-container">
            <span class="spinner"></span><span>Authenticating...</span>
          </span>
          <span v-else class="btn-text-wrapper">
            <span>Authorize &amp; Enter Garage</span>
            <i class="fa fa-arrow-right arrow-icon"></i>
          </span>
        </button>

        <p class="switch-hint">
          Don't have an account?
          <router-link to="/register" class="switch-link">Create one free →</router-link>
        </p>
      </form>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { useFormValidation } from '@/composables/useFormValidation';
import { validators } from '@/utils/validators';
import authService from '@/services/authService';

const emit = defineEmits(['success', 'error']);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

// ── Tab ────────────────────────────────────────
const activeTab = ref('login');

const switchTab = (tab) => {
  activeTab.value = tab;
};

// ── TOTP 2FA Login State ───────────────────────
const totpCode = ref('');
const totpLoading = ref(false);
const totpError = ref('');
const pendingTempToken = ref('');
const pendingQrCode = ref('');
const showQrCode = ref(false);

const cancelTOTP = () => {
  totpCode.value = '';
  totpError.value = '';
  pendingTempToken.value = '';
  pendingQrCode.value = '';
  showQrCode.value = false;
  activeTab.value = 'login';
};

const handleTOTPVerify = async () => {
  if (totpCode.value.length !== 6) {
    totpError.value = 'Please enter the full 6-digit code.';
    return;
  }
  totpLoading.value = true;
  totpError.value = '';
  try {
    await authStore.verifyLoginTOTP(pendingTempToken.value, totpCode.value);
    toast.success('Access authorized! Welcome back to BigBike Store.', 'Login Successful');
    emit('success');
    setTimeout(() => {
      const redirectTo = route.query.redirect;
      if (redirectTo && typeof redirectTo === 'string') {
        router.push(redirectTo);
      } else if (authStore.isAdmin) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }, 450);
  } catch (err) {
    const data = err.response?.data;
    let rawMsg = data?.message || err.message || 'Invalid or expired code. Please try again.';
    if (typeof rawMsg === 'object' && rawMsg !== null) {
      rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
    }
    const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
    totpError.value = msg;
    toast.error(msg, '2FA Verification Failed');
    totpCode.value = '';
    emit('error', err);
  } finally {
    totpLoading.value = false;
  }
};

// ── Login Form State ───────────────────────────
const loading = ref(false);
const showLoginPw = ref(false);
const rememberMe = ref(true);

const lf = reactive({ email: '', password: '' });

const { errors: le, touched: lt, validate: lValidate, validateField: lValidateField, touch: lTouch } = useFormValidation(lf, {
  email: [
    validators.required('Email address is required'),
    validators.email('Please enter a valid email address'),
  ],
  password: [
    validators.required('Password is required'),
    validators.minLength(4, 'Password must be at least 4 characters'),
  ],
});

const showForgotNotice = () => {
  forgotError.value = '';
  forgotSuccess.value = false;
  if (lf.email) forgotEmail.value = lf.email;
  switchTab('forgot');
};

// ── Forgot Password Form State ─────────────────
const forgotEmail = ref('');
const forgotLoading = ref(false);
const forgotError = ref('');
const forgotSuccess = ref(false);

const handleForgotPassword = async () => {
  forgotError.value = '';
  const email = forgotEmail.value.trim();
  if (!email || !email.includes('@')) {
    forgotError.value = 'Please enter a valid email address.';
    return;
  }
  forgotLoading.value = true;
  try {
    // POST /auth/forgot-password-request { email }
    await authService.requestPasswordReset(email);
    forgotSuccess.value = true;
    toast.success('Password reset instructions sent to your email!', 'Reset Link Sent');
  } catch (err) {
    const data = err.response?.data;
    let rawMsg = data?.message || data?.error || err.message || 'Failed to send reset link.';
    if (typeof rawMsg === 'object' && rawMsg !== null) {
      rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
    }
    const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
    forgotError.value = msg;
    toast.error(msg, 'Request Failed');
  } finally {
    forgotLoading.value = false;
  }
};

const handleGoogleLogin = () => {
  const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  window.location.href = `${backendBase}/auth/google`;
};

const handleLogin = async () => {
  if (!lValidate()) {
    toast.warning('Please resolve the highlighted errors.', 'Incomplete Form');
    return;
  }
  loading.value = true;
  const userEmail = lf.email;
  try {
    const response = await authStore.login({ email: lf.email, password: lf.password });

    // ── 2FA required: response shape is { result, data: { requiresTwoFactor, tempToken, twoFa } } ──
    const twoFaData = response?.data;
    const requires2FA =
      twoFaData?.requiresTwoFactor ||
      twoFaData?.requires2FA ||
      response?.requiresTwoFactor ||
      response?.requires2FA ||
      response?.twoFactorRequired;
    const tempToken =
      twoFaData?.tempToken ||
      response?.tempToken ||
      response?.temp_token;

    if (requires2FA && tempToken) {
      pendingTempToken.value = tempToken;
      // Extract QR code if present (first-time 2FA setup during login)
      const qrCode = twoFaData?.twoFa?.qrCode || response?.twoFa?.qrCode || '';
      pendingQrCode.value = qrCode;
      showQrCode.value = !!qrCode; // auto-expand if QR is present
      totpCode.value = '';
      totpError.value = '';
      activeTab.value = 'totp';
      loading.value = false;
      return;
    }

    toast.success('Access authorized! Welcome back to BigBike Store.', 'Login Successful');
    emit('success');
    setTimeout(() => {
      // If there's a ?redirect= query param, go there first
      const redirectTo = route.query.redirect;
      if (redirectTo && typeof redirectTo === 'string') {
        router.push(redirectTo);
      } else if (authStore.isAdmin) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }, 450);
  } catch (err) {
    const data = err.response?.data;
    let rawMsg = data?.message || err.message || 'Invalid email or password.';
    if (typeof rawMsg === 'object' && rawMsg !== null) {
      rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
    }
    const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);

    // Detect if the error indicates unverified email
    const isUnverified = err.isUnverified || 
                         msg.toLowerCase().includes('verify your email') ||
                         (typeof data?.message === 'object' && String(data?.message?.message).toLowerCase().includes('verify'));

    if (isUnverified) {
      toast.warning(msg, 'Email Verification Required');
      // Redirect to verification page with email prefilled
      setTimeout(() => {
        router.push({
          path: '/verify-email',
          query: { email: userEmail },
        });
      }, 1000);
    } else {
      toast.error(msg, 'Authorization Failed');
    }
    emit('error', err);
  } finally {
    loading.value = false;
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
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 4px;
  margin-bottom: 0.9rem;
  overflow: hidden;
}

.tab-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: linear-gradient(135deg, rgba(14,165,233,0.25) 0%, rgba(56,189,248,0.15) 100%);
  border: 1px solid rgba(56,189,248,0.35);
  border-radius: 10px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  padding: 0.6rem 1rem;
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
  width: 1rem;
  height: 1rem;
}

/* ── Header ───────────────────────────────────── */
.auth-header {
  margin-bottom: 0.9rem;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #38bdf8;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.brand-pill.register-pill {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}

.brand-pill.forgot-pill {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.brand-pill.totp-pill {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(129, 140, 248, 0.35);
  color: #a5b4fc;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: pulse-glow 2s infinite ease-in-out;
}

.pulse-dot.green {
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}

.pulse-dot.amber {
  background: #fbbf24;
  box-shadow: 0 0 8px #fbbf24;
}

.pulse-dot.cyan {
  background: #a5b4fc;
  box-shadow: 0 0 8px #a5b4fc;
}

/* ── TOTP Panel ───────────────────────────── */
.totp-shield-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding: 0.5rem 0;
}

.totp-shield {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.14);
  border: 2px solid rgba(129, 140, 248, 0.4);
  color: #a5b4fc;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.18);
  animation: shield-pulse 3s ease-in-out infinite;
}

@keyframes shield-pulse {
  0%, 100% { box-shadow: 0 0 24px rgba(99, 102, 241, 0.18); }
  50% { box-shadow: 0 0 36px rgba(99, 102, 241, 0.35); }
}

.totp-hint {
  font-size: 0.83rem;
  color: #94a3b8;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.totp-hint strong {
  color: #c7d2fe;
}

.totp-input {
  font-size: 1.6rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.35em;
  text-align: center;
  color: #a5b4fc !important;
  font-variant-numeric: tabular-nums;
  padding-right: 0.5rem !important;
}

/* ── TOTP digit progress dots ─────────────────── */
.totp-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: 0.85rem;
  flex-shrink: 0;
}

.totp-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(165, 180, 252, 0.2);
  border: 1.5px solid rgba(129, 140, 248, 0.3);
  transition: all 0.18s ease;
}

.totp-dot.filled {
  background: #a5b4fc;
  border-color: #a5b4fc;
  box-shadow: 0 0 6px rgba(165, 180, 252, 0.6);
}

/* ── TOTP QR Code section ─────────────────────── */
.totp-qr-section {
  border: 1px solid rgba(129, 140, 248, 0.22);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(99, 102, 241, 0.06);
}

.totp-qr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.totp-qr-header:hover {
  background: rgba(99, 102, 241, 0.1);
}

.totp-qr-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: #a5b4fc;
}

.totp-qr-chevron {
  font-size: 0.75rem;
  color: #a5b4fc;
  opacity: 0.7;
  transition: transform 0.2s;
}

.totp-qr-body {
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
}

.totp-qr-inst {
  font-size: 0.78rem;
  color: #94a3b8;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.totp-qr-inst strong {
  color: #c7d2fe;
}

.totp-qr-img-wrap {
  background: #ffffff;
  border-radius: 10px;
  padding: 8px;
  display: inline-block;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.totp-qr-img {
  width: 160px;
  height: 160px;
  display: block;
  image-rendering: pixelated;
}

.totp-qr-done {
  font-size: 0.76rem;
  color: #a5b4fc;
  margin: 0;
  font-weight: 500;
}

/* QR expand transition */
.qr-expand-enter-active,
.qr-expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.qr-expand-enter-from,
.qr-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding: 0 1rem;
}
.qr-expand-enter-to,
.qr-expand-leave-from {
  opacity: 1;
  max-height: 320px;
}


/* ── Forgot Success Box ──────────────────────── */
.forgot-success-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 1rem 0;
}

.forgot-success-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  border: 2px solid rgba(52, 211, 153, 0.4);
  color: #34d399;
  font-size: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot-success-box h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.forgot-success-box p {
  font-size: 0.9rem;
  color: #94a3b8;
  line-height: 1.55;
  margin: 0;
}

.forgot-success-box strong {
  color: #38bdf8;
}

.submit-btn.forgot-btn {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%);
  box-shadow: 0 8px 20px -4px rgba(245, 158, 11, 0.45);
}

.submit-btn.forgot-btn:hover:not(:disabled) {
  box-shadow: 0 12px 24px -4px rgba(245, 158, 11, 0.6);
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.02em;
  margin-bottom: 0.3rem;
}

.form-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.45;
}

/* ── Header Transitions ───────────────────────── */
.header-fade-enter-active,
.header-fade-leave-active { transition: all 0.2s ease; }
.header-fade-enter-from,
.header-fade-leave-to { opacity: 0; transform: translateY(6px); }

/* ── Google OAuth Button ──────────────────────── */
.google-oauth-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1.5px solid rgba(255, 255, 255, 0.14);
  color: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.google-oauth-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.google-icon {
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: -0.2rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.auth-divider span {
  padding: 0 0.75rem;
  color: #64748b;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

/* ── Form Transitions ─────────────────────────── */
.form-slide-enter-active,
.form-slide-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.form-slide-enter-from { opacity: 0; transform: translateX(20px); }
.form-slide-leave-to { opacity: 0; transform: translateX(-20px); }

/* ── Auth Form ────────────────────────────────── */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  font-size: 0.83rem;
  font-weight: 600;
  color: #cbd5e1;
  letter-spacing: 0.01em;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(11, 15, 25, 0.8);
  border: 1.5px solid #1e293b;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  color: #64748b;
  padding-left: 0.75rem;
  flex-shrink: 0;
  transition: color 0.2s;
}

.input-icon svg {
  width: 1.1rem;
  height: 1.1rem;
}

.input-group input {
  flex: 1;
  padding: 0.8rem 0.75rem 0.8rem 0.4rem;
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 0.93rem;
  font-family: inherit;
  outline: none;
  min-width: 0;
}

.input-group input::placeholder { color: #475569; }

.input-group:focus-within {
  border-color: #38bdf8;
  background: rgba(15, 23, 42, 0.9);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.18), inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.input-group:focus-within .input-icon { color: #38bdf8; }

.input-group.is-error {
  border-color: #f43f5e;
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.18);
}

.input-group.is-error .input-icon { color: #f43f5e; }

.input-group.is-valid { border-color: #10b981; }

.visibility-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 0.2s;
}

.visibility-btn svg { width: 1.15rem; height: 1.15rem; }
.visibility-btn:hover { color: #cbd5e1; }

/* ── Strength Bar ─────────────────────────────── */
.strength-bar-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.15rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 9999px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.35s ease, background-color 0.35s ease;
}

.strength-fill.weak { background: #f43f5e; }
.strength-fill.fair { background: #f59e0b; }
.strength-fill.good { background: #38bdf8; }
.strength-fill.strong { background: #10b981; }

.strength-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.strength-label.weak { color: #f43f5e; }
.strength-label.fair { color: #f59e0b; }
.strength-label.good { color: #38bdf8; }
.strength-label.strong { color: #10b981; }

/* ── Error ────────────────────────────────────── */
.error-msg {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: #fb7185;
  margin-top: 0.1rem;
}

.error-icon { width: 0.9rem; height: 0.9rem; flex-shrink: 0; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.2s ease-out; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Demo Helpers ─────────────────────────────── */
.demo-helpers {
  background: rgba(15, 23, 42, 0.6);
  border: 1px dashed rgba(51, 65, 85, 0.8);
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.demo-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.demo-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.demo-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.4);
  color: #cbd5e1;
  font-size: 0.73rem;
  padding: 0.22rem 0.55rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.demo-chip:hover {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.45);
  color: #f8fafc;
  transform: translateY(-1px);
}

.chip-badge {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 0.08rem 0.3rem;
  border-radius: 4px;
}
.chip-badge.admin { background: #f59e0b; color: #1e1b4b; }
.chip-badge.user  { background: #0ea5e9; color: #0c4a6e; }

/* ── Form Options ─────────────────────────────── */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
}

.remember-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  cursor: pointer;
  user-select: none;
  font-size: 0.8rem;
}

.remember-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  border: 1.5px solid #475569;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.8);
  display: inline-block;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remember-label input:checked + .custom-checkbox {
  background: #0ea5e9;
  border-color: #0ea5e9;
}

.remember-label input:checked + .custom-checkbox::after {
  content: '';
  position: absolute;
  left: 4.5px;
  top: 1.5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-link {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.8rem;
  transition: color 0.2s;
}
.forgot-link:hover { color: #7dd3fc; text-decoration: underline; }

/* ── Submit Button ────────────────────────────── */
.submit-btn {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.9rem 1.25rem;
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%);
  background-size: 200% auto;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 8px 20px -4px rgba(14, 165, 233, 0.5), inset 0 1px 0 rgba(255,255,255,0.15);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-btn.register-btn {
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
  box-shadow: 0 8px 20px -4px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255,255,255,0.15);
}

.submit-btn:hover:not(:disabled) {
  background-position: right center;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(14, 165, 233, 0.6), 0 0 12px rgba(56, 189, 248, 0.25);
}

.submit-btn.register-btn:hover:not(:disabled) {
  box-shadow: 0 12px 24px -4px rgba(16, 185, 129, 0.5);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.arrow-icon { width: 1.1rem; height: 1.1rem; transition: transform 0.2s; }
.submit-btn:hover:not(:disabled) .arrow-icon { transform: translateX(3px); }

.spinner-container { display: flex; align-items: center; justify-content: center; gap: 0.6rem; }
.spinner {
  width: 17px;
  height: 17px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Switch Hint ──────────────────────────────── */
.switch-hint {
  text-align: center;
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.switch-link {
  background: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  color: #38bdf8;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
  transition: color 0.2s;
}
.switch-link:hover { color: #7dd3fc; }

/* ── Terms Notice ─────────────────────────────── */
.terms-notice {
  font-size: 0.76rem;
  color: #64748b;
  line-height: 1.5;
  margin: -0.2rem 0 -0.2rem;
}

.terms-notice a {
  color: #38bdf8;
  text-decoration: none;
}
.terms-notice a:hover { text-decoration: underline; }

/* ── Footer ───────────────────────────────────── */
.form-footer {
  margin-top: 1.25rem;
  text-align: center;
  border-top: 1px solid rgba(51, 65, 85, 0.4);
  padding-top: 0.85rem;
}

.form-footer p {
  font-size: 0.73rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.shield-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  font-size: 0.63rem;
  font-weight: 700;
  padding: 0.08rem 0.38rem;
  border-radius: 4px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
</style>
