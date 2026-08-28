<template>
  <div class="reset-page">
    <div class="glow-orb glow-top"></div>
    <div class="glow-orb glow-bottom"></div>

    <div class="reset-card">
      <!-- ── SUCCESS STATE ── -->
      <div v-if="success" class="state-block">
        <div class="icon-ring success-ring">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2>Password Updated!</h2>
        <p class="state-desc">Your rider credentials have been updated securely. You can now sign in with your new password.</p>
        <button class="submit-btn" @click="goToLogin">
          Sign In Now →
        </button>
      </div>

      <!-- ── FORM STATE ── -->
      <div v-else class="form-wrapper">
        <div class="reset-header">
          <div class="brand-pill">
            <span class="pulse-dot"></span>
            <span>ACCOUNT SECURITY</span>
          </div>
          <h2 class="form-title">Set New Password</h2>
          <p class="form-subtitle">Choose a strong password to protect your rider account.</p>
        </div>

        <form @submit.prevent="handleResetPassword" class="auth-form" novalidate>
          <!-- Token input if not in URL -->
          <div v-if="!hasUrlToken" class="form-group">
            <label for="reset-token">Security Reset Token</label>
            <div class="input-group" :class="{ 'is-error': errors.token }">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                </svg>
              </span>
              <input
                id="reset-token"
                v-model="form.token"
                type="text"
                placeholder="Paste token from email link"
                :disabled="loading"
              />
            </div>
            <span v-if="errors.token" class="error-msg">{{ errors.token }}</span>
          </div>

          <!-- New Password -->
          <div class="form-group">
            <label for="new-password">New Password</label>
            <div class="input-group" :class="{ 'is-error': errors.newPassword }">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                </svg>
              </span>
              <input
                id="new-password"
                v-model="form.newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Minimum 6 characters"
                :disabled="loading"
                autocomplete="new-password"
              />
              <button type="button" class="visibility-btn" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745A10.034 10.034 0 0019.336 10.6a1.651 1.651 0 000-1.186A10.004 10.004 0 0010 3c-2.072 0-3.993.633-5.59 1.714L3.28 2.22zM7.53 6.47l1.528 1.529a2.5 2.5 0 013.443 3.443l1.529 1.528A4 4 0 007.53 6.47zm-2.06 2.06a9.97 9.97 0 00-4.806 2.06 1.65 1.65 0 000 1.186A10.004 10.004 0 0010 17c1.782 0 3.46-.468 4.922-1.288l-1.57-1.57a4 4 0 01-5.882-5.882l-2-2z" clip-rule="evenodd" /></svg>
              </button>
            </div>
            <!-- Strength meter -->
            <div v-if="form.newPassword" class="strength-bar-wrap">
              <div class="strength-bar">
                <div class="strength-fill" :class="pwStrengthClass" :style="{ width: pwStrengthPct + '%' }"></div>
              </div>
              <span class="strength-label" :class="pwStrengthClass">{{ pwStrengthLabel }}</span>
            </div>
            <span v-if="errors.newPassword" class="error-msg">{{ errors.newPassword }}</span>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirm-password">Confirm New Password</label>
            <div class="input-group" :class="{ 'is-error': errors.confirmPassword }">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                </svg>
              </span>
              <input
                id="confirm-password"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Re-enter your new password"
                :disabled="loading"
                autocomplete="new-password"
              />
              <button type="button" class="visibility-btn" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1">
                <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745A10.034 10.034 0 0019.336 10.6a1.651 1.651 0 000-1.186A10.004 10.004 0 0010 3c-2.072 0-3.993.633-5.59 1.714L3.28 2.22zM7.53 6.47l1.528 1.529a2.5 2.5 0 013.443 3.443l1.529 1.528A4 4 0 007.53 6.47zm-2.06 2.06a9.97 9.97 0 00-4.806 2.06 1.65 1.65 0 000 1.186A10.004 10.004 0 0010 17c1.782 0 3.46-.468 4.922-1.288l-1.57-1.57a4 4 0 01-5.882-5.882l-2-2z" clip-rule="evenodd" /></svg>
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
          </div>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner-container">
              <span class="spinner"></span><span>Resetting Password...</span>
            </span>
            <span v-else>Update Password &amp; Continue</span>
          </button>

          <p class="switch-hint">
            Remembered your credentials?
            <router-link to="/login" class="switch-link">Back to Sign In</router-link>
          </p>
        </form>
      </div>
    </div>

    <!-- Branding -->
    <div class="brand-footer">
      <span class="brand-icon">🏍️</span>
      <span class="brand-name">BigBike<span class="brand-store">STORE</span></span>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '@/services/authService';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(false);
const success = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const hasUrlToken = ref(false);

const form = reactive({
  token: '',
  newPassword: '',
  confirmPassword: '',
});

const errors = reactive({
  token: '',
  newPassword: '',
  confirmPassword: '',
});

onMounted(() => {
  const token = route.query.token;
  if (token) {
    form.token = token;
    hasUrlToken.value = true;
  }
});

// Password strength calculation
const pwStrengthScore = computed(() => {
  const pw = form.newPassword;
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
});

const pwStrengthPct = computed(() => Math.min(100, (pwStrengthScore.value / 5) * 100));

const pwStrengthLabel = computed(() => {
  const s = pwStrengthScore.value;
  if (s <= 1) return 'Weak';
  if (s <= 2) return 'Fair';
  if (s <= 3) return 'Good';
  if (s <= 4) return 'Strong';
  return 'Excellent';
});

const pwStrengthClass = computed(() => {
  const s = pwStrengthScore.value;
  if (s <= 1) return 'weak';
  if (s <= 2) return 'fair';
  if (s <= 3) return 'good';
  return 'strong';
});

const validateForm = () => {
  errors.token = '';
  errors.newPassword = '';
  errors.confirmPassword = '';
  let valid = true;

  if (!form.token.trim()) {
    errors.token = 'Reset token is required.';
    valid = false;
  }

  if (!form.newPassword) {
    errors.newPassword = 'New password is required.';
    valid = false;
  } else if (form.newPassword.length < 6) {
    errors.newPassword = 'Password must be at least 6 characters.';
    valid = false;
  }

  if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
    valid = false;
  }

  return valid;
};

const handleResetPassword = async () => {
  if (!validateForm()) return;

  loading.value = true;
  try {
    // POST /auth/reset-password { token, newPassword }
    await authService.resetPassword(form.token.trim(), form.newPassword);
    success.value = true;
    toast.success('Password updated successfully! Please sign in.', 'Password Reset');
  } catch (err) {
    const data = err.response?.data;
    let rawMsg = data?.message || data?.error || err.message || 'Password reset failed. The link may have expired.';
    if (typeof rawMsg === 'object' && rawMsg !== null) {
      rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
    }
    const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
    toast.error(msg, 'Reset Failed');
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => router.push('/login');
</script>

<style scoped>
* { box-sizing: border-box; }

.reset-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #070a12;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
}

.glow-orb {
  position: absolute;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(130px);
  opacity: 0.18;
  z-index: 0;
}

.glow-top {
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, #0284c7, transparent 70%);
}

.glow-bottom {
  bottom: -180px;
  right: -80px;
  background: radial-gradient(circle, #7c3aed, transparent 70%);
}

.reset-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 460px;
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem 2.25rem;
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  margin: 0 1rem;
}

.reset-header {
  margin-bottom: 1.5rem;
  text-align: left;
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

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

.form-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.02em;
  margin: 0 0 0.3rem 0;
}

.form-subtitle {
  font-size: 0.875rem;
  color: #94a3b8;
  line-height: 1.45;
  margin: 0;
}

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

label {
  font-size: 0.83rem;
  font-weight: 600;
  color: #cbd5e1;
}

.input-group {
  display: flex;
  align-items: center;
  background: rgba(11, 15, 25, 0.8);
  border: 1.5px solid #1e293b;
  border-radius: 10px;
  transition: all 0.25s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}

.input-group:focus-within {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.18);
}

.input-group.is-error {
  border-color: #f43f5e;
}

.input-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  color: #64748b;
  padding-left: 0.75rem;
  flex-shrink: 0;
}

.input-icon svg { width: 1.1rem; height: 1.1rem; }
.input-group:focus-within .input-icon { color: #38bdf8; }

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

.visibility-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
}

.visibility-btn svg { width: 1.15rem; height: 1.15rem; }
.visibility-btn:hover { color: #cbd5e1; }

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
  transition: width 0.35s ease;
}

.strength-fill.weak { background: #f43f5e; }
.strength-fill.fair { background: #f59e0b; }
.strength-fill.good { background: #38bdf8; }
.strength-fill.strong { background: #10b981; }

.strength-label {
  font-size: 0.72rem;
  font-weight: 700;
}
.strength-label.weak { color: #f43f5e; }
.strength-label.fair { color: #f59e0b; }
.strength-label.good { color: #38bdf8; }
.strength-label.strong { color: #10b981; }

.error-msg {
  font-size: 0.76rem;
  color: #fb7185;
}

.submit-btn {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.9rem 1.25rem;
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 8px 20px -4px rgba(14, 165, 233, 0.5);
  transition: all 0.25s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(14, 165, 233, 0.6);
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.spinner {
  width: 17px;
  height: 17px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.switch-hint {
  text-align: center;
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.switch-link {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 600;
}
.switch-link:hover { text-decoration: underline; }

/* ── State Block ───────────────────────────────── */
.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.state-block h2 {
  font-size: 1.65rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.state-desc {
  font-size: 0.93rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
}

.icon-ring {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.icon-ring svg { width: 32px; height: 32px; }

.success-ring {
  background: rgba(16,185,129,0.12);
  border: 2px solid rgba(52,211,153,0.4);
  color: #34d399;
}

.brand-footer {
  position: absolute;
  bottom: 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
}

.brand-icon { font-size: 1.25rem; }
.brand-name { font-size: 1rem; font-weight: 800; color: #f8fafc; }
.brand-store { font-size: 0.6rem; font-weight: 800; letter-spacing: 0.18em; color: #38bdf8; margin-left: 0.35rem; }
</style>
