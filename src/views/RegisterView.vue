<template>
  <div class="register-page" :style="{ backgroundImage: `url(${authBg})` }">
    <!-- Dark Atmospheric Overlay -->
    <div class="bg-overlay"></div>

    <!-- Ambient Glow Accents -->
    <div class="glow-orb glow-top"></div>
    <div class="glow-orb glow-bottom"></div>

    <!-- Centered Form Container -->
    <main class="register-center-wrapper">
      <div class="register-card-container">
        <!-- Brand Logo Header -->
        <div class="register-brand-header">
          <router-link to="/" class="brand-logo-link" title="BigBike Store Home">
            <img :src="logoImg" alt="BigBike Store" class="brand-logo-img" />
          </router-link>
        </div>

        <!-- Centered Glass Form Card -->
        <div class="glass-form-card">
          <RegisterForm />
        </div>

        <!-- Bottom Security / Copyright Note -->
        <div class="register-footer-info">
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
import RegisterForm from '@/components/RegisterForm.vue';
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
.register-page {
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
  background: radial-gradient(circle, #10b981 0%, #34d399 40%, transparent 70%);
}

.glow-bottom {
  bottom: -150px;
  right: 15%;
  background: radial-gradient(circle, #0ea5e9 0%, #38bdf8 40%, transparent 70%);
}

/* Center Content Area */
.register-center-wrapper {
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

.register-card-container {
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

/* Logo Header */
.register-brand-header {
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
  height: 40px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 16px rgba(16, 185, 129, 0.3));
}

/* Centered Glass Form Card */
.glass-form-card {
  width: 100%;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(52, 211, 153, 0.22);
  border-radius: 20px;
  padding: 1.4rem 1.65rem;
  box-shadow:
    0 25px 60px -15px rgba(0, 0, 0, 0.85),
    0 0 35px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.glass-form-card:hover {
  border-color: rgba(52, 211, 153, 0.35);
  box-shadow:
    0 30px 70px -15px rgba(0, 0, 0, 0.9),
    0 0 45px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Footer / Security info */
.register-footer-info {
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
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
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
  .register-center-wrapper {
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
