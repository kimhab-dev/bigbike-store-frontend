<template>
  <div class="home-page">

    <!-- ════════════════════════════════════════════════════════
         SECTION 1: HERO BANNER SWIPER / CAROUSEL
    ════════════════════════════════════════════════════════ -->
    <section class="hero-carousel-section" @mouseenter="pauseAutoplay" @mouseleave="startAutoplay">
      <div class="carousel-container">
        <!-- Slides -->
        <div
          v-for="(slide, index) in slides"
          :key="slide.id"
          class="carousel-slide"
          :class="{ active: currentSlide === index, 'prev-slide': isPrevSlide(index) }"
        >
          <div class="slide-image-wrapper">
            <img :src="slide.image" :alt="slide.title" class="slide-img" />
            <div class="slide-overlay"></div>
            <div class="slide-mesh-glow" :style="{ background: slide.accentGlow }"></div>
          </div>

          <div class="slide-content-container">
            <div class="slide-content">
              <div class="badge-tag">
                <span class="badge-pulse"></span>
                <span>{{ slide.badge }}</span>
              </div>

              <h1 class="slide-title">
                {{ slide.titlePrefix }} <br />
                <span class="gradient-text">{{ slide.titleHighlight }}</span>
              </h1>

              <p class="slide-description">
                {{ slide.description }}
              </p>

              <!-- Live Specs Badges -->
              <div class="slide-specs">
                <div v-for="spec in slide.specs" :key="spec.label" class="spec-pill">
                  <span class="spec-value">{{ spec.value }}</span>
                  <span class="spec-label">{{ spec.label }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="slide-actions">
                <router-link
                  v-if="!authStore.isAuthenticated"
                  to="/login"
                  class="btn-primary"
                >
                  <span>Explore Fleet &amp; Sign In</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
                    <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
                  </svg>
                </router-link>

                <router-link
                  v-else-if="authStore.isAdmin"
                  to="/dashboard"
                  class="btn-primary"
                >
                  <span>Admin Control Center</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
                    <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
                  </svg>
                </router-link>

                <router-link
                  v-else
                  to="/profile"
                  class="btn-primary"
                >
                  <span>My Rider Profile</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="btn-icon">
                    <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
                  </svg>
                </router-link>

                <a href="#featured-fleet" class="btn-secondary">
                  <span>View Showroom</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button class="nav-arrow prev" @click="prevSlide" aria-label="Previous Slide">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button class="nav-arrow next" @click="nextSlide" aria-label="Next Slide">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <!-- Pagination Bullets & Progress Bar -->
        <div class="carousel-indicators">
          <button
            v-for="(slide, index) in slides"
            :key="'dot-' + index"
            class="indicator-dot"
            :class="{ active: currentSlide === index }"
            @click="goToSlide(index)"
            :aria-label="'Go to slide ' + (index + 1)"
          >
            <span class="dot-fill" :style="currentSlide === index ? { animationDuration: autoplayInterval + 'ms' } : {}"></span>
            <span class="dot-title">{{ slide.shortTitle }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════
         SECTION 2: FEATURED FLEET & MACHINE SHOWCASE
    ════════════════════════════════════════════════════════ -->
    <section id="featured-fleet" class="section fleet-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-badge">TRACK &amp; ROAD WEAPONS</div>
          <h2 class="section-title">Engineered For <span class="gradient-text">Pure Adrenaline</span></h2>
          <p class="section-subtitle">
            From premier 1000cc homologation specials to hyper-naked street monsters.
          </p>
        </div>

        <!-- Loading state -->
        <div v-if="productsLoading" class="products-loading">
          <div class="loading-spinner"></div>
          <p>Loading fleet data...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="productsError" class="products-error">
          <span>⚠️</span>
          <p>{{ productsError }}</p>
          <button @click="fetchProducts" class="retry-btn">Retry</button>
        </div>

        <!-- Empty state -->
        <div v-else-if="products.length === 0" class="products-empty">
          <span>🏍️</span>
          <p>No machines in the garage yet. Check back soon.</p>
        </div>

        <!-- Product Grid -->
        <div v-else class="fleet-grid">
          <div
            v-for="product in products"
            :key="product.id"
            class="bike-card"
          >
            <div class="bike-card-image-wrap">
              <ProductImage
                :src="product.image"
                :alt="product.name"
                img-class="bike-img"
              />
              <div class="bike-category-badge">
                {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
              </div>
              <div class="bike-overlay-spec">#{{ product.id }}</div>
            </div>

            <div class="bike-card-body">
              <div class="bike-header">
                <span class="bike-brand">BigBike Store</span>
                <h3 class="bike-name">{{ product.name }}</h3>
              </div>

              <div class="bike-specs-grid">
                <div class="bike-spec-item" v-if="product.year || product.engince || product.engine">
                  <span class="spec-k">Engine / Year</span>
                  <span class="spec-v">{{ (product.engince || product.engine) ? `${product.engince || product.engine}cc` : '' }} {{ product.year ? `· ${product.year}` : '' }}</span>
                </div>
                <div class="bike-spec-item" v-else>
                  <span class="spec-k">Model</span>
                  <span class="spec-v">BigBike</span>
                </div>
                <div class="bike-spec-item" v-if="product.color">
                  <span class="spec-k">Color</span>
                  <span class="spec-v color-spec-item">
                    <span class="color-dot-sm" :style="{ backgroundColor: product.color }"></span>
                    {{ product.color }}
                  </span>
                </div>
                <div class="bike-spec-item" v-else>
                  <span class="spec-k">Description</span>
                  <span class="spec-v">{{ product.description || 'Exclusive' }}</span>
                </div>
                <div class="bike-spec-item">
                  <span class="spec-k">Stock</span>
                  <span class="spec-v" :class="{ highlight: product.stock > 0 }">{{ product.stock }} units</span>
                </div>
              </div>

              <div class="bike-card-footer">
                <div class="bike-price">
                  <span class="price-label">Price</span>
                  <span class="price-val">{{ formatPrice(product.price) }}</span>
                </div>
                <div class="card-actions">
                  <router-link
                    :to="authStore.isAuthenticated ? `/products/${product.id}` : `/login?redirect=/products/${product.id}`"
                    class="card-action-btn"
                  >
                    <span>View &amp; Order</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" /></svg>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════
         SECTION 3: PERFORMANCE & ENGINEERING PILLARS
    ════════════════════════════════════════════════════════ -->
    <section class="section tech-section">
      <div class="tech-bg-mesh"></div>
      <div class="section-container">
        <div class="section-header">
          <div class="section-badge gold">PERFORMANCE STANDARDS</div>
          <h2 class="section-title">The BigBike <span class="gradient-text-gold">Engineering Edge</span></h2>
          <p class="section-subtitle">
            Every machine in our garage receives factory-spec calibration and telemetry diagnostics.
          </p>
        </div>

        <div class="tech-grid">
          <div class="tech-card">
            <div class="tech-icon-wrap">
              <span class="tech-icon">⚡</span>
            </div>
            <h3>6-Axis IMU Telemetry</h3>
            <p>Real-time banking angle, traction slip, and wheelie mitigation algorithms tuned for race tracks.</p>
            <div class="tech-stat"><strong>200 Hz</strong> Sensor Sampling</div>
          </div>

          <div class="tech-card">
            <div class="tech-icon-wrap">
              <span class="tech-icon">🛡️</span>
            </div>
            <h3>120-Point Dyno Certification</h3>
            <p>Full brake horsepower and torque curve mapping before any motorcycle enters the showroom.</p>
            <div class="tech-stat"><strong>99.8%</strong> Dyno Precision</div>
          </div>

          <div class="tech-card">
            <div class="tech-icon-wrap">
              <span class="tech-icon">💨</span>
            </div>
            <h3>Aerodynamic Winglets</h3>
            <p>Downforce generation delivering over 30kg of high-speed stability at 270 km/h straightaways.</p>
            <div class="tech-stat"><strong>+30 kg</strong> Anti-Lift Force</div>
          </div>

          <div class="tech-card">
            <div class="tech-icon-wrap">
              <span class="tech-icon">🔧</span>
            </div>
            <h3>Titanium &amp; Carbon Spec</h3>
            <p>Akrapovič full race manifolds and dry carbon monocoque components for minimal unsprung weight.</p>
            <div class="tech-stat"><strong>-18 kg</strong> Weight Reduction</div>
          </div>
        </div>

        <!-- Metrics Strip -->
        <div class="metrics-strip">
          <div class="metric-item">
            <span class="metric-num">500+</span>
            <span class="metric-desc">Hyperbikes Delivered</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-item">
            <span class="metric-num">310+</span>
            <span class="metric-desc">km/h Peak Velocity</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-item">
            <span class="metric-num">100%</span>
            <span class="metric-desc">Certified Inspection</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-item">
            <span class="metric-num">24/7</span>
            <span class="metric-desc">Trackside Telemetry</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════
         SECTION 4: VIP TRACK CLUB & TEST RIDE CTA
    ════════════════════════════════════════════════════════ -->
    <section class="section cta-section">
      <div class="section-container">
        <div class="cta-banner-card">
          <div class="cta-content">
            <div class="cta-badge">EXCLUSIVE RIDER COMMUNITY</div>
            <h2 class="cta-title">Ready To Claim Your Machine?</h2>
            <p class="cta-desc">
              Sign up today to access the cloud garage inventory, view exclusive dyno reports, and schedule a private circuit test ride.
            </p>

            <div class="cta-benefits">
              <div class="benefit-chip">
                <span class="chip-check">✓</span>
                <span>VIP Track Day Invitations</span>
              </div>
              <div class="benefit-chip">
                <span class="chip-check">✓</span>
                <span>Priority Service Scheduling</span>
              </div>
              <div class="benefit-chip">
                <span class="chip-check">✓</span>
                <span>Direct Access to Master Technicians</span>
              </div>
            </div>

            <div class="cta-buttons">
              <router-link
                v-if="!authStore.isAuthenticated"
                to="/login"
                class="cta-main-btn"
              >
                Create Free Rider Account →
              </router-link>
              <router-link
                v-else-if="authStore.isAdmin"
                to="/dashboard"
                class="cta-main-btn"
              >
                Access Control Dashboard →
              </router-link>
              <router-link
                v-else
                to="/profile"
                class="cta-main-btn"
              >
                View Rider Profile →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════════
         FOOTER
    ════════════════════════════════════════════════════════ -->
    <footer class="home-footer">
      <div class="footer-container">
        <div class="footer-brand-col">
          <div class="footer-logo">
            <span class="footer-logo-badge">🏍️</span>
            <span class="footer-logo-text">BigBike<span class="tag">STORE</span></span>
          </div>
          <p class="footer-bio">
            The premier high-performance motorcycle dealership and multi-bike telemetry platform.
          </p>
          <div class="footer-ssl">
            <span class="ssl-dot"></span>
            <span>256-Bit SSL Encrypted Platform</span>
          </div>
        </div>

        <div class="footer-links-col">
          <h4>Showroom Models</h4>
          <ul>
            <li><a href="#featured-fleet">Superbike 1000cc+</a></li>
            <li><a href="#featured-fleet">Hyper Naked Series</a></li>
            <li><a href="#featured-fleet">Sport Touring Machines</a></li>
            <li><a href="#featured-fleet">Track Day Homologations</a></li>
          </ul>
        </div>

        <div class="footer-links-col">
          <h4>Services &amp; Garage</h4>
          <ul>
            <li v-if="authStore.isAdmin"><router-link to="/dashboard">Admin Dashboard</router-link></li>
            <li><router-link to="/profile">Rider Profile</router-link></li>
            <li><router-link to="/verify-email">Email Verification</router-link></li>
            <li><a href="#featured-fleet">Dyno Calibration</a></li>
          </ul>
        </div>

        <div class="footer-links-col">
          <h4>Track HQ</h4>
          <p class="footer-contact">
            <strong>BigBike Circuit Center</strong><br />
            Phnom Penh Motor Speedway Complex<br />
            Open Tue – Sun: 08:00 – 19:00
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} BigBike Store. Engineered with Passion &amp; Speed.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import productService from '@/services/productService';
import ProductImage from '@/components/ProductImage.vue';

// Import banner images from hero-banner
import banner1 from '@/assets/image/hero-banner/1.png';
import banner2 from '@/assets/image/hero-banner/2.png';
import banner3 from '@/assets/image/hero-banner/3.png';

const authStore = useAuthStore();

// ── Slider State & Data ─────────────────────────
const currentSlide = ref(0);
const autoplayInterval = 5500;
let autoplayTimer = null;

const slides = [
  {
    id: 1,
    image: banner1,
    badge: 'SUPERBIKE FLAGSHIP',
    shortTitle: 'Yamaha YZF-R1M',
    titlePrefix: 'Precision Throttle,',
    titleHighlight: 'Track Domination',
    description: 'Equipped with Öhlins Electronic Racing Suspension and a 998cc crossplane inline-4 pumping 200 HP of unfiltered racecraft adrenaline.',
    accentGlow: 'radial-gradient(circle, rgba(14, 165, 233, 0.45) 0%, transparent 70%)',
    specs: [
      { value: '200 HP', label: 'Crossplane Engine' },
      { value: '2.8s', label: '0-100 km/h' },
      { value: '299 km/h', label: 'Top Speed' },
      { value: '202 kg', label: 'Wet Weight' },
    ],
  },
  {
    id: 2,
    image: banner2,
    badge: 'HOMOLOGATION SPECIAL',
    shortTitle: 'BMW S1000RR M',
    titlePrefix: 'ShiftCam Power,',
    titleHighlight: 'Zero Compromise',
    description: 'Bavarian engineering refined on world circuits. 205 horsepower with M Carbon wheels, aerodynamic winglets, and Launch Control assistance.',
    accentGlow: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, transparent 70%)',
    specs: [
      { value: '205 HP', label: 'ShiftCam Inline-4' },
      { value: '2.7s', label: '0-100 km/h' },
      { value: '306 km/h', label: 'Top Speed' },
      { value: '193 kg', label: 'M Package Weight' },
    ],
  },
  {
    id: 3,
    image: banner3,
    badge: 'DESMODROMIC MASTERPIECE',
    shortTitle: 'Ducati Panigale V4 S',
    titlePrefix: 'Italian Passion,',
    titleHighlight: 'Pure V4 Symphony',
    description: '1,103cc Desmosedici Stradale delivering 215.5 HP. Factory Brembo Stylema calipers and race-derived aerodynamic wing configuration.',
    accentGlow: 'radial-gradient(circle, rgba(239, 68, 68, 0.45) 0%, transparent 70%)',
    specs: [
      { value: '215.5 HP', label: 'Desmosedici V4' },
      { value: '2.6s', label: '0-100 km/h' },
      { value: '315 km/h', label: 'Top Speed' },
      { value: '195 kg', label: 'Kerb Weight' },
    ],
  },
];

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

const goToSlide = (index) => {
  currentSlide.value = index;
  resetAutoplay();
};

const isPrevSlide = (index) => {
  return (currentSlide.value - 1 + slides.length) % slides.length === index;
};

const startAutoplay = () => {
  if (autoplayTimer) clearInterval(autoplayTimer);
  autoplayTimer = setInterval(() => {
    nextSlide();
  }, autoplayInterval);
};

const pauseAutoplay = () => {
  if (autoplayTimer) clearInterval(autoplayTimer);
};

const resetAutoplay = () => {
  pauseAutoplay();
  startAutoplay();
};

onMounted(() => {
  startAutoplay();
  fetchProducts();
});

onUnmounted(() => {
  pauseAutoplay();
});

// ── Fleet — Live API Products ──────────────────
const products = ref([]);
const productsLoading = ref(false);
const productsError = ref('');

// Helpers to format API data for the UI card
const formatPrice = (p) => {
  if (p == null) return 'Contact us';
  return '$' + Number(p).toLocaleString();
};

const fetchProducts = async () => {
  productsLoading.value = true;
  productsError.value = '';
  try {
    const res = await productService.getAllProducts();
    // Handle both { data: [...] } and direct array shapes
    const raw = res?.data?.data ?? res?.data ?? res ?? [];
    products.value = Array.isArray(raw) ? raw : (raw.items ?? raw.results ?? raw.data ?? []);
  } catch (err) {
    productsError.value = 'Failed to load products.';
    products.value = [];
  } finally {
    productsLoading.value = false;
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.home-page {
  background-color: #070a12;
  color: #f8fafc;
  min-height: 100vh;
  overflow-x: hidden;
  font-family: 'Inter', 'Outfit', system-ui, sans-serif;
}

/* ════════════════════════════════════════════════════════
   SECTION 1: HERO BANNER SWIPER
════════════════════════════════════════════════════════ */
.hero-carousel-section {
  position: relative;
  width: 100%;
  height: 90vh;
  min-height: 640px;
  max-height: 880px;
  background: #000000;
  overflow: hidden;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.85s;
  z-index: 1;
}

.carousel-slide.active {
  opacity: 1;
  visibility: visible;
  z-index: 2;
}

.slide-image-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  transform: scale(1.08);
  transition: transform 7s cubic-bezier(0.25, 1, 0.5, 1);
}

.carousel-slide.active .slide-img {
  transform: scale(1);
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(7, 10, 18, 0.95) 0%,
    rgba(7, 10, 18, 0.75) 45%,
    rgba(7, 10, 18, 0.3) 100%
  ),
  linear-gradient(
    180deg,
    rgba(7, 10, 18, 0.3) 0%,
    rgba(7, 10, 18, 0.8) 100%
  );
}

.slide-mesh-glow {
  position: absolute;
  top: -10%;
  left: 10%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(140px);
  pointer-events: none;
  opacity: 0.35;
}

.slide-content-container {
  position: relative;
  z-index: 3;
  max-width: 1360px;
  height: 100%;
  margin: 0 auto;
  padding: 0 2.5rem;
  display: flex;
  align-items: center;
}

.slide-content {
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.carousel-slide.active .badge-tag {
  animation: fadeInUp 0.6s ease forwards 0.1s;
}
.carousel-slide.active .slide-title {
  animation: fadeInUp 0.7s ease forwards 0.2s;
}
.carousel-slide.active .slide-description {
  animation: fadeInUp 0.7s ease forwards 0.3s;
}
.carousel-slide.active .slide-specs {
  animation: fadeInUp 0.7s ease forwards 0.4s;
}
.carousel-slide.active .slide-actions {
  animation: fadeInUp 0.7s ease forwards 0.5s;
}

.badge-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.4);
  backdrop-filter: blur(10px);
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #38bdf8;
  width: fit-content;
}

.badge-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.5; }
}

.slide-title {
  font-size: clamp(2.4rem, 4.5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #ffffff;
  text-shadow: 0 4px 16px rgba(0,0,0,0.6);
}

.gradient-text {
  background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.slide-description {
  font-size: 1.05rem;
  line-height: 1.6;
  color: #cbd5e1;
  text-shadow: 0 2px 6px rgba(0,0,0,0.6);
}

.slide-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.spec-pill {
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  min-width: 100px;
}

.spec-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: #f8fafc;
}

.spec-label {
  font-size: 0.68rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.slide-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%);
  color: #ffffff;
  padding: 0.85rem 1.65rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 8px 24px -4px rgba(14, 165, 233, 0.5);
  transition: all 0.25s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -4px rgba(14, 165, 233, 0.7);
}

.btn-icon {
  width: 1.1rem;
  height: 1.1rem;
  transition: transform 0.2s;
}

.btn-primary:hover .btn-icon {
  transform: translateX(4px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f8fafc;
  padding: 0.85rem 1.4rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  backdrop-filter: blur(8px);
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(56, 189, 248, 0.5);
  transform: translateY(-2px);
}

/* Nav Arrows */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-arrow svg {
  width: 22px;
  height: 22px;
}

.nav-arrow:hover {
  background: #0ea5e9;
  border-color: #38bdf8;
  transform: translateY(-50%) scale(1.08);
}

.nav-arrow.prev { left: 2rem; }
.nav-arrow.next { right: 2rem; }

/* Indicators */
.carousel-indicators {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  gap: 0.75rem;
}

.indicator-dot {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  overflow: hidden;
  transition: all 0.25s ease;
}

.indicator-dot.active {
  background: rgba(14, 165, 233, 0.2);
  border-color: #38bdf8;
  color: #ffffff;
}

.dot-fill {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #64748b;
  transition: background-color 0.3s;
}

.indicator-dot.active .dot-fill {
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ════════════════════════════════════════════════════════
   COMMON SECTION STYLES
════════════════════════════════════════════════════════ */
.section {
  padding: 6rem 1.5rem;
  position: relative;
}

.section-container {
  max-width: 1360px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 3rem auto;
}

.section-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  margin-bottom: 0.75rem;
}

.section-badge.gold {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
}

.section-title {
  font-size: clamp(2rem, 3.2vw, 2.75rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.section-subtitle {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.6;
}

.gradient-text-gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ════════════════════════════════════════════════════════
   SECTION 2: FLEET SHOWCASE
════════════════════════════════════════════════════════ */
.fleet-section {
  background: #090e1a;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.category-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 2.5rem;
}

.filter-btn {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 0.55rem 1.1rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: rgba(56, 189, 248, 0.4);
  color: #ffffff;
}

.filter-btn.active {
  background: #0ea5e9;
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 4px 16px -2px rgba(14, 165, 233, 0.5);
}

.fleet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.75rem;
}

/* ── Products API States ────────────────────── */
.products-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 5rem 1rem;
  color: #94a3b8;
  font-size: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.products-error,
.products-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 5rem 1rem;
  text-align: center;
  color: #94a3b8;
}

.products-error span,
.products-empty span {
  font-size: 3rem;
}

.products-error p,
.products-empty p {
  font-size: 1rem;
  max-width: 400px;
}

.retry-btn {
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(14, 165, 233, 0.3);
}

.bike-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bike-card:hover {
  transform: translateY(-6px);
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(14, 165, 233, 0.15);
}

.bike-card-image-wrap {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: #000000;
}

.bike-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.6s ease;
}

.bike-card:hover .bike-img {
  transform: scale(1.08);
}

.bike-category-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(7, 10, 18, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #38bdf8;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
}

.bike-overlay-spec {
  position: absolute;
  bottom: 0.85rem;
  right: 0.85rem;
  background: rgba(14, 165, 233, 0.85);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.8rem;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.bike-card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.bike-header {
  margin-bottom: 1.1rem;
}

.bike-brand {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.bike-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin-top: 0.15rem;
}

.bike-specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem 1rem;
  background: rgba(11, 15, 25, 0.6);
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 1.25rem;
}

.bike-spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
}

.spec-k { color: #64748b; }
.spec-v { color: #cbd5e1; font-weight: 600; }
.spec-v.highlight { color: #38bdf8; font-weight: 700; }

.color-spec-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  text-transform: capitalize;
}

.color-dot-sm {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

.bike-card-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1rem;
}

.bike-price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.68rem;
  color: #64748b;
  text-transform: uppercase;
}

.price-val {
  font-size: 1.2rem;
  font-weight: 800;
  color: #38bdf8;
}

.card-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #ffffff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.card-action-btn svg {
  width: 0.9rem;
  height: 0.9rem;
  transition: transform 0.2s;
}

.card-action-btn:hover {
  background: #0ea5e9;
  border-color: #38bdf8;
}

.card-action-btn:hover svg {
  transform: translateX(3px);
}

/* ════════════════════════════════════════════════════════
   SECTION 3: TECH PILLARS
════════════════════════════════════════════════════════ */
.tech-section {
  background: #070a12;
  position: relative;
}

.tech-bg-mesh {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 500px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
  filter: blur(140px);
  pointer-events: none;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.tech-card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: all 0.3s ease;
}

.tech-card:hover {
  border-color: rgba(245, 158, 11, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.6);
}

.tech-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tech-icon { font-size: 1.6rem; }

.tech-card h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f8fafc;
}

.tech-card p {
  font-size: 0.88rem;
  color: #94a3b8;
  line-height: 1.55;
  flex: 1;
}

.tech-stat {
  font-size: 0.8rem;
  color: #fbbf24;
  border-top: 1px dashed rgba(245, 158, 11, 0.2);
  padding-top: 0.75rem;
}

.metrics-strip {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1.5rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  padding: 2rem 2.5rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-num {
  font-size: 2.5rem;
  font-weight: 800;
  color: #38bdf8;
  letter-spacing: -0.02em;
}

.metric-desc {
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.metric-divider {
  width: 1px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
}

/* ════════════════════════════════════════════════════════
   SECTION 4: VIP TRACK CLUB CTA
════════════════════════════════════════════════════════ */
.cta-section {
  background: #090e1a;
}

.cta-banner-card {
  position: relative;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 24px;
  padding: 4rem 3rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}

.cta-banner-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 2;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.cta-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #38bdf8;
  text-transform: uppercase;
}

.cta-title {
  font-size: clamp(2rem, 3.5vw, 3rem);
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
}

.cta-desc {
  font-size: 1.05rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.cta-benefits {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0.5rem 0;
}

.benefit-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.92rem;
  color: #f8fafc;
  font-weight: 500;
}

.chip-check {
  color: #34d399;
  font-weight: 800;
}

.cta-main-btn {
  display: inline-block;
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%);
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  text-decoration: none;
  box-shadow: 0 10px 25px -4px rgba(14, 165, 233, 0.5);
  transition: all 0.25s ease;
  width: fit-content;
}

.cta-main-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px -4px rgba(14, 165, 233, 0.7);
}

/* ════════════════════════════════════════════════════════
   FOOTER
════════════════════════════════════════════════════════ */
.home-footer {
  background: #04070e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4rem 1.5rem 2rem 1.5rem;
}

.footer-container {
  max-width: 1360px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.8fr 1fr 1fr 1.2fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.footer-logo-badge { font-size: 1.5rem; }

.footer-logo-text {
  font-size: 1.35rem;
  font-weight: 800;
  color: #f8fafc;
}

.footer-logo-text .tag {
  font-size: 0.65rem;
  color: #38bdf8;
  letter-spacing: 0.18em;
  margin-left: 0.3rem;
}

.footer-bio {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.25rem;
  max-width: 320px;
}

.footer-ssl {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
}

.ssl-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
}

.footer-links-col h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 1.1rem;
}

.footer-links-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.footer-links-col a {
  color: #94a3b8;
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links-col a:hover {
  color: #38bdf8;
}

.footer-contact {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.6;
}

.footer-contact strong {
  color: #f8fafc;
}

.footer-bottom {
  max-width: 1360px;
  margin: 0 auto;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1.5rem;
  text-align: center;
  font-size: 0.8rem;
  color: #475569;
}

/* ════════════════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
════════════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
  }
}

@media (max-width: 768px) {
  .hero-carousel-section {
    height: auto;
    min-height: 560px;
    padding: 3rem 0;
  }

  .slide-content-container {
    padding: 0 1.25rem;
  }

  .slide-title {
    font-size: 2.2rem;
  }

  .nav-arrow { display: none; }

  .indicator-dot .dot-title { display: none; }

  .fleet-grid {
    grid-template-columns: 1fr;
  }

  .metrics-strip {
    flex-direction: column;
    gap: 1.5rem;
  }

  .metric-divider {
    width: 60%;
    height: 1px;
  }

  .cta-banner-card {
    padding: 2.5rem 1.5rem;
  }

  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>
