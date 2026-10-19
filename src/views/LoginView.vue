<template>
  <div class="login-split-page">
    <!-- Left Hero Column (Matches Reference Image) -->
    <div class="auth-hero-panel">
      <!-- Top Brand Logo -->
      <div class="hero-brand">
        <router-link to="/" class="brand-link" title="BigBike Store Home">
          <div class="brand-icon-box">
            <i class="fa fa-motorcycle"></i>
          </div>
          <span class="brand-title">BigBike</span>
        </router-link>
      </div>

      <!-- Center Content: Headline, Subtitle & Superbike Vector -->
      <div class="hero-content">
        <div class="hero-text-block">
          <h1 class="hero-headline">Your garage is open.</h1>
          <p class="hero-subtext">Check your orders, manage your bikes and book service, all in one place.</p>
        </div>

        <!-- Sleek Minimalist Wireframe Superbike Vector -->
        <div class="hero-illustration">
          <svg class="bike-wireframe-svg" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Rear Wheel & Hub -->
            <circle cx="110" cy="210" r="58" stroke="#2563eb" stroke-width="2.6" />
            <circle cx="110" cy="210" r="14" stroke="#2563eb" stroke-width="2.2" />

            <!-- Front Wheel & Hub -->
            <circle cx="430" cy="210" r="58" stroke="#2563eb" stroke-width="2.6" />
            <circle cx="430" cy="210" r="14" stroke="#2563eb" stroke-width="2.2" />

            <!-- Swingarm & Lower Drive -->
            <path d="M110 210 L230 208 L260 150" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M110 210 L195 150" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Main Chassis / Perimeter Truss Frame -->
            <path d="M195 150 L260 150 L315 208 L375 208" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M230 208 L300 208 L345 150" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Tank, Seat & Tail Geometry -->
            <path d="M160 120 L230 150 L295 150 L330 95 L375 90 L345 150 L390 210" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M160 120 L220 120 L275 150" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Front Telescopic Fork & Clip-on Handlebar -->
            <path d="M375 90 L430 210" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M330 95 L375 90" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />

            <!-- Aerodynamic Tail Support Strut -->
            <path d="M190 185 L160 120" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>

      <!-- Bottom Copyright -->
      <div class="hero-footer">
        <span>&copy; {{ new Date().getFullYear() }} BigBike Store</span>
      </div>
    </div>

    <!-- Right Form Column -->
    <div class="auth-form-panel">
      <!-- Mobile Logo Header (visible on small screens only) -->
      <div class="mobile-brand-header">
        <router-link to="/" class="brand-link" title="BigBike Store Home">
          <div class="brand-icon-box">
            <i class="fa fa-motorcycle"></i>
          </div>
          <span class="brand-title">BigBike</span>
        </router-link>
      </div>

      <div class="auth-form-card">
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import LoginForm from '@/components/LoginForm.vue';

onMounted(() => {
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.login-split-page {
  display: flex;
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  background: #080d19;
  color: #f8fafc;
  overflow: hidden;
}

/* ── 1. LEFT HERO PANEL ────────────────────────────────────── */
.auth-hero-panel {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem 4rem;
  background: #060a14;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.hero-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
}

.brand-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto 0;
  padding: 1.5rem 0;
}

.hero-text-block {
  margin-bottom: 2.5rem;
}

.hero-headline {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0 0 0.85rem 0;
}

.hero-subtext {
  font-size: 1rem;
  color: #8c9cb0;
  line-height: 1.55;
  max-width: 440px;
  margin: 0;
}

.hero-illustration {
  width: 100%;
  max-width: 520px;
  opacity: 0.95;
}

.bike-wireframe-svg {
  width: 100%;
  height: auto;
  display: block;
  filter: drop-shadow(0 0 16px rgba(37, 99, 235, 0.25));
}

.hero-footer {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

/* ── 2. RIGHT FORM PANEL ───────────────────────────────────── */
.auth-form-panel {
  flex: 0.95;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: #080d19;
  overflow-y: auto;
  position: relative;
}

.mobile-brand-header {
  display: none;
  margin-bottom: 2rem;
}

.auth-form-card {
  width: 100%;
  max-width: 410px;
}

/* ── RESPONSIVE DESIGN ─────────────────────────────────────── */
@media (max-width: 1024px) {
  .auth-hero-panel {
    padding: 2.5rem 2rem;
  }
  .hero-headline {
    font-size: 2.4rem;
  }
}

@media (max-width: 860px) {
  .login-split-page {
    flex-direction: column;
    overflow-y: auto;
    height: auto;
    min-height: 100vh;
  }

  .auth-hero-panel {
    display: none;
  }

  .mobile-brand-header {
    display: flex;
  }

  .auth-form-panel {
    flex: 1;
    min-height: 100vh;
    padding: 3rem 1.5rem;
    justify-content: center;
  }
}
</style>
