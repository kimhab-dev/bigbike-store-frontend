<template>
  <div class="login-page" :style="{ backgroundImage: `url(${authBg})` }">
    <!-- Dark Atmospheric Overlay -->
    <div class="bg-overlay"></div>

    <!-- Ambient Glow Accents -->
    <div class="glow-orb glow-top"></div>
    <div class="glow-orb glow-bottom"></div>

    <!-- Centered Form Container -->
    <main class="login-center-wrapper">
      <div class="login-card-container">
        <!-- Brand Logo Header -->
        <div class="login-brand-header">
          <router-link to="/" class="brand-logo-link" title="BigBike Store Home">
            <img :src="logoImg" alt="BigBike Store" class="brand-logo-img" />
          </router-link>
        </div>

        <!-- Centered Glass Form Card -->
        <div class="glass-form-card">
          <LoginForm />
        </div>

        <!-- Bottom Security / Copyright Note -->
        <div class="login-footer-info">
          <div class="security-badge">
            <i class="bi bi-shield-check"></i>
          </div>
          <span class="copyright-text">&copy; {{ new Date().getFullYear() }} BigBike Store. All rights reserved.</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import LoginForm from '@/components/LoginForm.vue';
import authBg from '@/assets/image/bg/auth-bg.png';
import logoImg from '@/assets/image/logo/logo.png';

onMounted(() => {
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.login-page {
  position: relative;
  height: 100vh;
  max-height: 100vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #f8fafc;
  overflow: hidden;
}

/* Atmospheric Overlay with Soft Blur */
.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(7, 10, 19, 0.88) 0%,
    rgba(15, 23, 42, 0.82) 50%,
    rgba(7, 10, 19, 0.92) 100%
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1;
}

/* Ambient Glowing Orbs */
.glow-orb {
  position: absolute;
  width: 550px;
  height: 550px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(140px);
  opacity: 0.18;
  z-index: 2;
}

.glow-top {
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, #0ea5e9 0%, #38bdf8 40%, transparent 70%);
}

.glow-bottom {
  bottom: -150px;
  right: 15%;
  background: radial-gradient(circle, #6366f1 0%, #0ea5e9 40%, transparent 70%);
}

/* Top Navigation Bar */
.login-top-bar {
  position: relative;
  z-index: 10;
  padding: 1.5rem 2rem 0.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  padding: 0.5rem 1rem;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  backdrop-filter: blur(10px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.back-link i {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.back-link:hover {
  color: #ffffff;
  background: rgba(14, 165, 233, 0.15);
  border-color: rgba(56, 189, 248, 0.35);
  transform: translateX(-2px);
}

.back-link:hover i {
  transform: translateX(-3px);
}

/* Center Content Area */
.login-center-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
}

.login-card-container {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
}

/* Logo Header */
.login-brand-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo-link {
  display: inline-block;
  transition: transform 0.25s ease;
}

.brand-logo-link:hover {
  transform: scale(1.04);
}

.brand-logo-img {
  height: 42px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 16px rgba(14, 165, 233, 0.3));
}

/* Centered Glass Form Card */
.glass-form-card {
  width: 100%;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 20px;
  padding: 1.65rem 1.75rem;
  box-shadow:
    0 25px 60px -15px rgba(0, 0, 0, 0.85),
    0 0 35px rgba(14, 165, 233, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.glass-form-card:hover {
  border-color: rgba(56, 189, 248, 0.32);
  box-shadow:
    0 30px 70px -15px rgba(0, 0, 0, 0.9),
    0 0 45px rgba(14, 165, 233, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Footer / Security info */
.login-footer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.security-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  letter-spacing: 0.02em;
}

.security-badge i {
  font-size: 0.9rem;
}

.copyright-text {
  font-size: 0.78rem;
  color: #64748b;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .login-top-bar {
    padding: 1rem 1rem 0 1rem;
  }

  .login-center-wrapper {
    padding: 1rem 1rem 2rem 1rem;
  }

  .glass-form-card {
    padding: 1.75rem 1.25rem;
    border-radius: 20px;
  }

  .brand-logo-img {
    height: 46px;
  }
}
</style>
