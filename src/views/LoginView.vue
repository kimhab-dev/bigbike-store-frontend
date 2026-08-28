<template>
  <div class="fullscreen-login">
    <!-- Ambient Background Glows -->
    <div class="glow-orb glow-top-left"></div>
    <div class="glow-orb glow-bottom-right"></div>



    <!-- Main Split Screen Content -->
    <div class="login-split-container">
      <!-- Left Showcase / Image Hero -->
      <section class="showcase-section">
        <div class="showcase-media-wrapper">
          <img
            :src="bikeHeroImg"
            alt="BigBike High Performance Motorcycle"
            class="hero-bike-image"
          />
          <div class="media-overlay-gradient"></div>
        </div>

        <div class="showcase-content">
          <div class="showcase-badge">
            <span class="pulse-ring"></span>
            <span>NEXT-GEN POWERSPORTS</span>
          </div>

          <h1 class="showcase-title">
            Unleash The <br />
            <span class="gradient-text">Ultimate Throttle</span>
          </h1>

          <p class="showcase-desc">
            Access real-time telemetry, track-ready tuning presets, and your exclusive multi-bike cloud garage.
          </p>

          <!-- Feature Badges -->
          <div class="feature-pills">
            <div class="feature-pill">
              <span class="pill-icon">⚡</span>
              <div class="pill-info">
                <strong>1000cc+ Machines</strong>
                <small>Hyperbike Inventory</small>
              </div>
            </div>
            <div class="feature-pill">
              <span class="pill-icon">🛡️</span>
              <div class="pill-info">
                <strong>Verified Garage</strong>
                <small>Track Diagnostics</small>
              </div>
            </div>
            <div class="feature-pill">
              <span class="pill-icon">🏁</span>
              <div class="pill-info">
                <strong>VIP Track Club</strong>
                <small>Exclusive Events</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Right Form Section -->
      <section class="form-section">
        <div class="glass-login-card">
          <!-- Separated Modular Login Form Component -->
          <LoginForm />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import LoginForm from '@/components/LoginForm.vue';
import bikeHeroImg from '@/assets/login-bike-hero.jpg';
</script>

<style scoped>
.fullscreen-login {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  background-color: #070a12;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: #f8fafc;
}

/* Ambient dynamic glow blobs */
.glow-orb {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(140px);
  z-index: 0;
  opacity: 0.25;
}

.glow-top-left {
  top: -150px;
  left: -100px;
  background: radial-gradient(circle, #0284c7 0%, #0369a1 70%, transparent 100%);
}

.glow-bottom-right {
  bottom: -150px;
  right: -100px;
  background: radial-gradient(circle, #38bdf8 0%, #0284c7 60%, transparent 100%);
}

/* Top Navigation Bar */
.login-nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2.5rem;
  width: 100%;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-badge {
  font-size: 1.5rem;
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.35rem 0.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f8fafc;
  line-height: 1.1;
}

.brand-tag {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #38bdf8;
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(51, 65, 85, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-home-btn .nav-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s;
}

.back-home-btn:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(56, 189, 248, 0.4);
  color: #f8fafc;
  transform: translateX(-2px);
}

.back-home-btn:hover .nav-icon {
  transform: translateX(-3px);
}

/* Split Screen Layout */
.login-split-container {
  position: relative;
  z-index: 5;
  flex: 1;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2.5rem 2.5rem 2.5rem;
  gap: 2.5rem;
  align-items: center;
}

/* Showcase Section */
.showcase-section {
  position: relative;
  height: 100%;
  min-height: 540px;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 3rem 2.5rem;
  border: 1px solid rgba(56, 189, 248, 0.15);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}

.showcase-media-wrapper {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-bike-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.03);
  transition: transform 10s ease;
}

.showcase-section:hover .hero-bike-image {
  transform: scale(1.08);
}

.media-overlay-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(7, 10, 18, 0.2) 0%,
    rgba(7, 10, 18, 0.65) 45%,
    rgba(7, 10, 18, 0.95) 100%
  );
}

.showcase-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 580px;
}

.showcase-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(56, 189, 248, 0.35);
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #38bdf8;
}

.pulse-ring {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
}

.showcase-title {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  letter-spacing: -0.03em;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.gradient-text {
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.showcase-desc {
  font-size: 1rem;
  color: #cbd5e1;
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.feature-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.feature-pill {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 0.85rem;
  border-radius: 12px;
  transition: all 0.2s;
}

.feature-pill:hover {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(30, 41, 59, 0.85);
  transform: translateY(-2px);
}

.pill-icon {
  font-size: 1.15rem;
}

.pill-info {
  display: flex;
  flex-direction: column;
}

.pill-info strong {
  font-size: 0.78rem;
  font-weight: 700;
  color: #f8fafc;
}

.pill-info small {
  font-size: 0.68rem;
  color: #94a3b8;
}

/* Form Section */
.form-section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glass-login-card {
  width: 100%;
  max-width: 460px;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 2.25rem 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Responsive Breakpoints */
@media (max-width: 1024px) {
  .login-split-container {
    grid-template-columns: 1fr;
    padding: 0 1.5rem 2rem 1.5rem;
    gap: 2rem;
  }

  .showcase-section {
    min-height: 380px;
    padding: 2rem 1.5rem;
  }

  .showcase-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 768px) {
  .fullscreen-login {
    height: auto;
    min-height: 100vh;
  }

  .login-nav {
    padding: 1rem 1.25rem;
  }

  .login-split-container {
    padding: 0 1rem 2rem 1rem;
  }

  .showcase-section {
    display: none; /* Mobile focuses on sleek card with background glow */
  }

  .glass-login-card {
    padding: 1.75rem 1.25rem;
    background: rgba(15, 23, 42, 0.9);
  }
}
</style>
