<template>
  <nav class="navbar">
    <div class="brand">
      <router-link to="/" class="brand-link">
        <img class="brand-name" src="../assets/image/logo/logo.png" alt="">
      </router-link>
    </div>
    <div class="nav-links">
      <!-- Storefront links visible only to regular visitors/users -->
      <template v-if="!authStore.isAdmin">
        <router-link to="/">
          <i class="bi bi-house-door"></i>
          <span>Home</span>
        </router-link>
        <a href="/#featured-fleet">
          <i class="fa fa-motorcycle"></i>
          <span>Showroom</span>
        </a>
      </template>

      <router-link v-if="!authStore.isAuthenticated" to="/login" class="nav-auth-btn">
        <i class="bi bi-box-arrow-in-right"></i>
        <span>Sign In</span>
      </router-link>

      <template v-if="authStore.isAuthenticated">
        <!-- Only Admins see Dashboard link -->
        <router-link v-if="authStore.isAdmin" to="/dashboard" class="dashboard-link">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </router-link>
        <!-- Regular users see My Orders -->
        <router-link v-if="!authStore.isAdmin" to="/orders" class="nav-orders-link">
          <i class="bi bi-bag-check"></i>
          <span>My Orders</span>
        </router-link>
        <router-link to="/profile" class="profile-nav-link">
          <i class="bi bi-person-circle"></i>
          <span>Profile</span>
        </router-link>
        <button @click="handleLogout" class="nav-logout-btn">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const handleLogout = () => {
  authStore.logout();
  toast.info('You have been logged out', 'Session Ended');
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 2.5rem;
  background: rgba(7, 10, 18, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  width: 120px !important;
}

.logo-icon {
  font-size: 1.35rem;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f8fafc;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-tag {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  color: #38bdf8;
  margin-left: 0.35rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.6rem;
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.2s ease;
}

.nav-links a:hover,
.nav-links a.router-link-exact-active {
  color: #38bdf8;
}

.nav-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
}

.nav-auth-btn {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  color: #ffffff !important;
  padding: 0.45rem 1.15rem;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
  transition: all 0.2s ease;
}

.nav-auth-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.5);
}

.nav-role-badge {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.12rem 0.45rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.badge-admin {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.badge-user {
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
}

.nav-logout-btn {
  background: transparent;
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #94a3b8;
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s ease;
}

.nav-logout-btn:hover {
  border-color: #f43f5e;
  color: #fb7185;
  background: rgba(244, 63, 94, 0.1);
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.85rem 1.25rem;
  }

  .nav-links {
    gap: 1rem;
  }
}
</style>
