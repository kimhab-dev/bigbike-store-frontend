<template>
  <div class="user-dashboard">
    <!-- Rider Hero Banner -->
    <div class="user-banner">
      <div class="banner-badge">🏍️ Rider Member</div>
      <h2>Welcome to Your Garage</h2>
      <p>Track your saved motorcycles, test-ride bookings, and purchase orders.</p>
    </div>

    <!-- User Metric Cards -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon red">❤️</div>
        <div class="metric-info">
          <h3>Wishlist</h3>
          <p class="value">3 Bikes</p>
          <span class="subtext">Saved models</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon blue">📅</div>
        <div class="metric-info">
          <h3>Test Rides</h3>
          <p class="value">1 Scheduled</p>
          <span class="subtext">Upcoming Saturday</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon green">📦</div>
        <div class="metric-info">
          <h3>My Orders</h3>
          <p class="value">0 Active</p>
          <span class="subtext">Ready to purchase</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon yellow">⭐</div>
        <div class="metric-info">
          <h3>Rider Points</h3>
          <p class="value">250 pts</p>
          <span class="subtext">Silver Tier</span>
        </div>
      </div>
    </div>

    <!-- User Quick Actions & Recommendations -->
    <div class="content-row">
      <div class="featured-card">
        <h3>Explore New Arrivals</h3>
        <p>Check out the latest 1000cc super sports and adventure tourers.</p>
        <button class="primary-btn" @click="handleExplore">
          Browse Catalog 🚀
        </button>
      </div>

      <div class="quick-links-card">
        <h3>Quick Access</h3>
        <ul>
          <li><a href="#" @click.prevent="toast.info('Viewing test ride appointments')">🏍️ My Test Rides</a></li>
          <li><a href="#" @click.prevent="toast.info('Viewing service history')">🔧 Maintenance Schedule</a></li>
          <li><router-link to="/profile">👤 Account Profile</router-link></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast';

const toast = useToast();

const handleExplore = () => {
  toast.info('Navigating to bike showroom catalog', 'Motorcycles');
};
</script>

<style scoped>
.user-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-banner {
  background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(3, 105, 161, 0.2);
}

.banner-badge {
  display: inline-block;
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-bottom: 0.75rem;
}

.user-banner h2 {
  font-size: 1.75rem;
  margin-bottom: 0.4rem;
}

.user-banner p {
  color: #bae6fd;
  font-size: 0.95rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  font-size: 2rem;
  padding: 0.75rem;
  border-radius: 12px;
}

.metric-icon.red { background: #fee2e2; }
.metric-icon.blue { background: #e0f2fe; }
.metric-icon.green { background: #dcfce7; }
.metric-icon.yellow { background: #fef3c7; }

.metric-info h3 {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-info .value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0.2rem 0;
}

.subtext {
  font-size: 0.75rem;
  color: #94a3b8;
}

.content-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .content-row {
    grid-template-columns: 1fr;
  }
}

.featured-card,
.quick-links-card {
  background: white;
  padding: 1.75rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.featured-card h3,
.quick-links-card h3 {
  font-size: 1.15rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.featured-card p {
  color: #64748b;
  margin-bottom: 1.25rem;
}

.primary-btn {
  padding: 0.75rem 1.5rem;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  background: #0284c7;
}

.quick-links-card ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.quick-links-card a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.15s;
}

.quick-links-card a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}
</style>
