<template>
  <div class="verify-page">
    <!-- Ambient Glow -->
    <div class="glow-orb glow-top"></div>
    <div class="glow-orb glow-bottom"></div>

    <div class="verify-card">

      <!-- ── AUTO-VERIFYING STATE ── -->
      <div v-if="state === 'verifying'" class="state-block">
        <div class="icon-ring spin-ring">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin-icon">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <h2>Verifying your email…</h2>
        <p class="state-desc">Please wait while we confirm your account.</p>
      </div>

      <!-- ── SUCCESS STATE ── -->
      <div v-else-if="state === 'success'" class="state-block">
        <div class="icon-ring success-ring">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2>Email Verified!</h2>
        <p class="state-desc">Your rider account is now active. You can sign in and access your garage.</p>
        <button class="action-btn primary" @click="goToLogin">
          Sign In Now
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="btn-arrow"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" /></svg>
        </button>
      </div>

      <!-- ── ERROR / EXPIRED STATE ── -->
      <div v-else-if="state === 'error'" class="state-block">
        <div class="icon-ring error-ring">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2>Link Invalid or Expired</h2>
        <p class="state-desc">{{ errorMessage }}</p>

        <!-- Resend form -->
        <div class="resend-section">
          <p class="resend-label">Resend a new verification link to your email:</p>
          <div class="resend-form">
            <div class="input-group" :class="{ 'is-error': resendError }">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>
              </span>
              <input v-model="resendEmail" type="email" placeholder="your@email.com" :disabled="resending" @keyup.enter="handleResend" />
            </div>
            <span v-if="resendError" class="error-msg">{{ resendError }}</span>
            <button class="action-btn primary" :disabled="resending" @click="handleResend">
              <span v-if="resending" class="spinner"></span>
              <span>{{ resending ? 'Sending…' : 'Resend Verification Email' }}</span>
            </button>
            <button class="action-btn ghost" @click="goToLogin">Back to Sign In</button>
          </div>
        </div>
      </div>

      <!-- ── AWAITING VERIFICATION (came from register, no token in URL) ── -->
      <div v-else-if="state === 'pending'" class="state-block">
        <div class="icon-ring pending-ring">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
          </svg>
        </div>
        <h2>Check Your Inbox</h2>
        <p class="state-desc">
          We sent a verification link to
          <strong class="highlight-email">{{ pendingEmail || 'your email address' }}</strong>.
          <br />Click the link in the email to activate your account.
        </p>

        <div class="email-tips">
          <div class="tip-row">
            <span class="tip-icon">📁</span>
            <span>Check your <strong>Spam / Junk</strong> folder if you don't see it.</span>
          </div>
          <div class="tip-row">
            <span class="tip-icon">⏳</span>
            <span>The link expires in <strong>24 hours</strong>.</span>
          </div>
        </div>

        <!-- Resend section -->
        <div class="resend-section">
          <p class="resend-label">Didn't receive it? Resend:</p>
          <div class="resend-form">
            <div class="input-group">
              <span class="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>
              </span>
              <input v-model="resendEmail" type="email" :placeholder="pendingEmail || 'your@email.com'" :disabled="resending || resendSuccess" />
            </div>
            <button class="action-btn secondary" :disabled="resending || resendSuccess" @click="handleResend">
              <span v-if="resending" class="spinner secondary-spinner"></span>
              <span>{{ resending ? 'Sending…' : resendSuccess ? '✓ Email Sent!' : 'Resend Email' }}</span>
            </button>
            <button class="action-btn ghost" @click="goToLogin">Back to Sign In</button>
          </div>
        </div>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import authService from '@/services/authService';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const toast = useToast();

// state: 'verifying' | 'pending' | 'success' | 'error'
const state = ref('pending');
const errorMessage = ref('');

// email passed via query ?email=xxx (from register redirect)
const pendingEmail = ref(route.query.email || '');

// resend form
const resendEmail = ref(route.query.email || '');
const resendError = ref('');
const resending = ref(false);
const resendSuccess = ref(false);

const goToLogin = () => router.push('/login');

// Auto-verify if token is in query params (?token=xxx)
onMounted(async () => {
  const token = route.query.token;
  if (token) {
    state.value = 'verifying';
    try {
      await authService.verifyEmail(token);
      state.value = 'success';
      toast.success('Email verified! You can now sign in.', 'Verified');
    } catch (err) {
      const data = err.response?.data;
      let rawMsg = data?.message || data?.error || err.message || 'Token is invalid or expired.';
      if (typeof rawMsg === 'object' && rawMsg !== null) {
        rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
      }
      errorMessage.value = Array.isArray(rawMsg) ? rawMsg.join(' ') : String(rawMsg);
      state.value = 'error';
    }
  } else {
    // No token — came from register page, show pending state
    state.value = 'pending';
  }
});

// Resend verification email
const handleResend = async () => {
  resendError.value = '';
  const email = resendEmail.value.trim() || pendingEmail.value.trim();
  if (!email || !email.includes('@')) {
    resendError.value = 'Please enter a valid email address.';
    return;
  }
  resending.value = true;
  try {
    await authService.resendVerificationEmail(email);
    resendSuccess.value = true;
    toast.success(`Verification email sent to ${email}`, 'Email Sent');
  } catch (err) {
    const data = err.response?.data;
    let rawMsg = data?.message || data?.error || err.message || 'Failed to resend. Please try again.';
    if (typeof rawMsg === 'object' && rawMsg !== null) {
      rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
    }
    resendError.value = Array.isArray(rawMsg) ? rawMsg.join(' ') : String(rawMsg);
    toast.error(resendError.value, 'Resend Failed');
  } finally {
    resending.value = false;
  }
};
</script>

<style scoped>
* { box-sizing: border-box; }

.verify-page {
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
  font-family: 'Inter', 'Outfit', system-ui, sans-serif;
}

/* ── Ambient Glows ─────────────────────────────── */
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

/* ── Card ──────────────────────────────────────── */
.verify-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
  background: rgba(15, 23, 42, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 2.75rem 2.25rem;
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
  margin: 0 1rem;
}

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
  letter-spacing: -0.02em;
  color: #f8fafc;
  margin: 0;
}

.state-desc {
  font-size: 0.93rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
  max-width: 340px;
}

/* ── Icon Rings ────────────────────────────────── */
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

.spin-ring {
  background: rgba(14,165,233,0.12);
  border: 2px solid rgba(56,189,248,0.3);
  color: #38bdf8;
}

.spin-icon {
  animation: spin-anim 1.2s linear infinite;
}

@keyframes spin-anim {
  to { transform: rotate(360deg); }
}

.success-ring {
  background: rgba(16,185,129,0.12);
  border: 2px solid rgba(52,211,153,0.4);
  color: #34d399;
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pop-in {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.error-ring {
  background: rgba(244,63,94,0.12);
  border: 2px solid rgba(251,113,133,0.4);
  color: #fb7185;
}

.pending-ring {
  background: rgba(14,165,233,0.12);
  border: 2px solid rgba(56,189,248,0.3);
  color: #38bdf8;
}

/* ── Highlight email ───────────────────────────── */
.highlight-email {
  color: #38bdf8;
}

/* ── Email Tips ────────────────────────────────── */
.email-tips {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  background: rgba(11,15,25,0.6);
  border: 1px solid rgba(51,65,85,0.6);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  text-align: left;
}

.tip-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: #94a3b8;
}

.tip-icon { font-size: 1rem; flex-shrink: 0; margin-top: 0.05rem; }

/* ── Resend Section ────────────────────────────── */
.resend-section {
  width: 100%;
  margin-top: 0.25rem;
}

.resend-label {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.6rem;
  text-align: left;
}

.resend-form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

/* ── Input ─────────────────────────────────────── */
.input-group {
  display: flex;
  align-items: center;
  background: rgba(11,15,25,0.8);
  border: 1.5px solid #1e293b;
  border-radius: 10px;
  transition: all 0.25s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
}

.input-group:focus-within {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56,189,248,0.18), inset 0 2px 4px rgba(0,0,0,0.2);
}

.input-group.is-error { border-color: #f43f5e; }

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

/* ── Error msg ─────────────────────────────────── */
.error-msg {
  font-size: 0.77rem;
  color: #fb7185;
  text-align: left;
}

/* ── Buttons ───────────────────────────────────── */
.action-btn {
  width: 100%;
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  font-size: 0.93rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%);
  color: #ffffff;
  box-shadow: 0 8px 20px -4px rgba(14,165,233,0.45);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(14,165,233,0.6);
}

.action-btn.secondary {
  background: rgba(30,41,59,0.85);
  border: 1px solid rgba(56,189,248,0.4);
  color: #38bdf8;
}

.action-btn.secondary:hover:not(:disabled) {
  background: rgba(56,189,248,0.12);
  transform: translateY(-1px);
}

.action-btn.ghost {
  background: transparent;
  border: 1px solid rgba(71,85,105,0.5);
  color: #64748b;
}

.action-btn.ghost:hover { color: #94a3b8; border-color: #475569; }

.action-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }

.btn-arrow { width: 1rem; height: 1rem; transition: transform 0.2s; }
.action-btn:hover:not(:disabled) .btn-arrow { transform: translateX(3px); }

/* ── Spinner ───────────────────────────────────── */
.spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin-anim 0.8s linear infinite;
  flex-shrink: 0;
}

.secondary-spinner {
  border: 2.5px solid rgba(56,189,248,0.25);
  border-top-color: #38bdf8;
}

/* ── Brand Footer ──────────────────────────────── */
.brand-footer {
  position: absolute;
  bottom: 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;
}

.brand-icon { font-size: 1.25rem; }

.brand-name {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f8fafc;
}

.brand-store {
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: #38bdf8;
  margin-left: 0.35rem;
  vertical-align: middle;
}
</style>
