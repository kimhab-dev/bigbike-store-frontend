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
    <!-- ════════════════════════════════════════════════════════
         SECTION 2: SHOWROOM FLEET & MACHINE SHOWCASE
    ════════════════════════════════════════════════════════ -->
    <section id="featured-fleet" class="section fleet-section showroom-section">
      <div class="section-container">
        <!-- Showroom Top Bar Header -->
        <div class="showroom-header">
          <div class="showroom-title-group">
            <h2 class="showroom-title">Showroom</h2>
            <p class="showroom-subtitle">{{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'bike' : 'bikes' }} available</p>
          </div>

          <div class="showroom-controls">
            <!-- Filter Pills -->
            <div class="showroom-filter-pills">
              <button
                type="button"
                class="filter-pill"
                :class="{ active: currentFilter === 'all' }"
                @click="currentFilter = 'all'"
              >
                All
              </button>
              <button
                type="button"
                class="filter-pill"
                :class="{ active: currentFilter === 'in_stock' }"
                @click="currentFilter = 'in_stock'"
              >
                In stock
              </button>
              <button
                type="button"
                class="filter-pill"
                :class="{ active: currentFilter === 'low_stock' }"
                @click="currentFilter = 'low_stock'"
              >
                Low stock
              </button>
            </div>

            <!-- Sort Dropdown -->
            <div class="showroom-sort-wrapper">
              <select v-model="currentSort" class="showroom-sort-select" aria-label="Sort showroom bikes">
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="engine_desc">Highest CC</option>
              </select>
              <svg class="sort-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="productsLoading" class="products-loading">
          <div class="loading-spinner"></div>
          <p>Loading fleet data...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="productsError && showroomBikes.length === 0" class="products-error">
          <span>⚠️</span>
          <p>{{ productsError }}</p>
          <button @click="fetchProducts" class="retry-btn">Retry</button>
        </div>

        <!-- Empty state after filter -->
        <div v-else-if="filteredProducts.length === 0" class="products-empty">
          <span>🏍️</span>
          <p>No bikes match this filter. Try selecting 'All'.</p>
          <button @click="currentFilter = 'all'" class="retry-btn">Reset Filters</button>
        </div>

        <!-- Product Cards Grid -->
        <div v-else class="fleet-grid">
          <div
            v-for="bike in homepageProducts"
            :key="bike.id"
            class="showroom-card"
          >
            <!-- Card Banner with dynamic gradient & superbike graphic -->
            <div
              class="card-banner"
              :style="{ background: getCardGradient(bike) }"
            >
              <!-- Top Left Stock Pill Tag -->
              <div class="card-stock-tag">
                <span
                  class="stock-dot"
                  :style="{ backgroundColor: getStockBadge(bike.stock).dotColor }"
                ></span>
                <span>{{ getStockBadge(bike.stock).text }}</span>
              </div>

              <!-- Bike Graphic / Photo -->
              <div class="card-graphic-wrap">
                <img
                  v-if="bike.image && !bike.image.includes('unsplash')"
                  :src="getProductImageUrl(bike.image)"
                  :alt="bike.name"
                  class="card-custom-img"
                  @error="onImageError(bike)"
                />
                <!-- Vector Superbike Outline SVG -->
                <svg
                  v-else
                  class="bike-wireframe-svg"
                  viewBox="0 0 540 280"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <!-- Rear Wheel & Hub -->
                  <circle cx="110" cy="210" r="58" stroke="#ffffff" stroke-width="4.5" />
                  <circle cx="110" cy="210" r="14" stroke="#ffffff" stroke-width="4.5" />

                  <!-- Front Wheel & Hub -->
                  <circle cx="430" cy="210" r="58" stroke="#ffffff" stroke-width="4.5" />
                  <circle cx="430" cy="210" r="14" stroke="#ffffff" stroke-width="4.5" />

                  <!-- Swingarm & Lower Drive -->
                  <path d="M110 210 L230 208 L260 150" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M110 210 L195 150" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />

                  <!-- Main Chassis / Perimeter Truss Frame -->
                  <path d="M195 150 L260 150 L315 208 L375 208" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M230 208 L300 208 L345 150" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />

                  <!-- Tank, Seat & Tail Geometry -->
                  <path d="M160 120 L230 150 L295 150 L330 95 L375 90 L345 150 L390 210" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M160 120 L220 120 L275 150" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />

                  <!-- Front Telescopic Fork & Clip-on Handlebar -->
                  <path d="M375 90 L430 210" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M330 95 L375 90" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />

                  <!-- Aerodynamic Tail Support Strut -->
                  <path d="M190 185 L160 120" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>

            <!-- Card Body / Details -->
            <div class="card-body">
              <div class="card-titles">
                <h3 class="bike-title">{{ bike.name }}</h3>
                <span class="bike-brand">{{ bike.brand }}</span>
              </div>

              <!-- 2x2 Specs Grid -->
              <div class="card-specs-grid">
                <div class="spec-cell">
                  <span class="spec-lbl">Engine</span>
                  <span class="spec-val">{{ formatEngine(bike.engine) }}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-lbl">Year</span>
                  <span class="spec-val">{{ bike.year || 2026 }}</span>
                </div>
                <div class="spec-cell">
                  <span class="spec-lbl">Color</span>
                  <span class="spec-val color-val">
                    <span
                      class="color-dot"
                      :style="{ backgroundColor: getColorDot(bike.color) }"
                    ></span>
                    <span>{{ bike.color || 'White' }}</span>
                  </span>
                </div>
                <div class="spec-cell">
                  <span class="spec-lbl">Available</span>
                  <span class="spec-val">{{ bike.stock ?? 0 }} units</span>
                </div>
              </div>

              <!-- Card Bottom: Price & Button -->
              <div class="card-bottom">
                <div class="card-price-group">
                  <span class="price-title">Price</span>
                  <span class="price-value">{{ formatPrice(bike.price) }}</span>
                </div>

                <router-link
                  :to="authStore.isAuthenticated ? `/products/${bike.id}` : `/login?redirect=/products/${bike.id}`"
                  class="btn-view-details"
                >
                  View details
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- See More Button -->
        <div v-if="!productsLoading && filteredProducts.length > 4" class="showroom-see-more-row">
          <router-link to="/showroom" class="btn-see-more">
            <span>See All {{ filteredProducts.length }} Bikes</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="see-more-icon">
              <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
            </svg>
          </router-link>
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

// ── Showroom Fleet & Machine Data ──────────────────
const products = ref([]);
const productsLoading = ref(false);
const productsError = ref('');

// Filter & Sort state
const currentFilter = ref('all'); // 'all' | 'in_stock' | 'low_stock'
const currentSort = ref('featured'); // 'featured' | 'price_asc' | 'price_desc' | 'engine_desc'

// Default showroom machines matching design
const defaultShowroomBikes = [
  {
    id: 1,
    name: 'Yamaha YZF-R1M',
    brand: 'Yamaha',
    engine: 999,
    year: 2026,
    color: 'White',
    stock: 9,
    price: 10000,
    image: null,
  },
  {
    id: 2,
    name: 'BMW S1000RR M',
    brand: 'BMW',
    engine: 999,
    year: 2026,
    color: 'White',
    stock: 10,
    price: 20000,
    image: null,
  },
  {
    id: 3,
    name: 'Ducati Panigale V4 S',
    brand: 'Ducati',
    engine: 1103,
    year: 2026,
    color: 'Red',
    stock: 2,
    price: 28000,
    image: null,
  },
];

// Normalized showroom bikes from API or fallback defaults
const showroomBikes = computed(() => {
  if (products.value && products.value.length > 0) {
    return products.value.map((p) => {
      const rawName = p.name || 'BigBike Model';
      // Format display name matching the showroom styling
      let displayName = rawName;
      if (rawName.toLowerCase().includes('r1') || rawName.toLowerCase().includes('yamamha') || rawName.toLowerCase().includes('yamaha')) {
        displayName = 'Yamaha YZF-R1M';
      } else if (rawName.toLowerCase().includes('s1000') || rawName.toLowerCase().includes('bmw')) {
        displayName = 'BMW S1000RR M';
      } else if (rawName.toLowerCase().includes('panigale') || rawName.toLowerCase().includes('ducati')) {
        displayName = 'Ducati Panigale V4 S';
      }

      // Brand
      let brand = p.brand;
      if (!brand) {
        if (rawName.toLowerCase().includes('yamaha') || rawName.toLowerCase().includes('yamamha')) brand = 'Yamaha';
        else if (rawName.toLowerCase().includes('bmw')) brand = 'BMW';
        else if (rawName.toLowerCase().includes('ducati')) brand = 'Ducati';
        else if (p.category?.name) brand = p.category.name;
        else brand = rawName.split(' ')[0] || 'BigBike';
      }

      // Engine (backend returns 'engince')
      const engine = p.engince != null ? p.engince : (p.engine != null ? p.engine : 999);

      // Color
      const rawColor = p.color || 'white';
      const color = rawColor.charAt(0).toUpperCase() + rawColor.slice(1).toLowerCase();

      // Stock & Price
      const stock = p.stock != null ? Number(p.stock) : 0;
      const price = p.price != null ? Number(p.price) : 0;

      return {
        id: p.id,
        name: displayName,
        rawName: rawName,
        brand: brand,
        engine: engine,
        year: p.year || 2026,
        color: color,
        stock: stock,
        price: price,
        image: p.image,
      };
    });
  }
  return defaultShowroomBikes;
});

// Filtered and sorted list for display
const filteredProducts = computed(() => {
  let list = [...showroomBikes.value];

  // Filtering
  if (currentFilter.value === 'in_stock') {
    list = list.filter((b) => Number(b.stock ?? 0) > 0);
  } else if (currentFilter.value === 'low_stock') {
    list = list.filter((b) => {
      const s = Number(b.stock ?? 0);
      return s > 0 && s <= 3;
    });
  }

  // Sorting
  if (currentSort.value === 'price_asc') {
    list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (currentSort.value === 'price_desc') {
    list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  } else if (currentSort.value === 'engine_desc') {
    list.sort((a, b) => (Number(b.engine) || 0) - (Number(a.engine) || 0));
  }

  return list;
});

// Home page preview: only show first 4 bikes, full list is on /showroom
const homepageProducts = computed(() => filteredProducts.value.slice(0, 4));

// Helpers to format specs & visual styling
const getProductImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('blob:') || imgPath.startsWith('data:')) {
    return imgPath;
  }
  const clean = imgPath.replace(/^\//, '');
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${apiBase}/${clean}`;
};

const formatPrice = (p) => {
  if (p == null) return '$0';
  return '$' + Math.round(Number(p)).toLocaleString();
};

const formatEngine = (engine) => {
  if (!engine) return '999 cc';
  const num = Number(engine);
  return isNaN(num) ? `${engine} cc` : `${num.toLocaleString()} cc`;
};

const getColorDot = (color) => {
  if (!color) return '#ffffff';
  const c = color.toLowerCase().trim();
  if (c.includes('red') || c === '#ef4444' || c === '#dc2626') return '#ef4444';
  if (c.includes('white') || c === '#ffffff' || c === '#fff') return '#ffffff';
  if (c.includes('black') || c === '#000000' || c === '#000') return '#1e293b';
  if (c.includes('blue') || c === '#3b82f6') return '#3b82f6';
  if (c.includes('green') || c === '#10b981') return '#10b981';
  if (c.includes('orange') || c === '#f97316') return '#f97316';
  if (c.includes('yellow') || c === '#eab308') return '#eab308';
  return color;
};

const getStockBadge = (stock) => {
  const s = Number(stock ?? 0);
  if (s <= 0) {
    return { text: 'Out of stock', dotColor: '#ef4444' };
  }
  if (s <= 2) {
    return { text: `Only ${s} left`, dotColor: '#f59e0b' };
  }
  return { text: 'In stock', dotColor: '#22c55e' };
};

const getCardGradient = (bike) => {
  const brand = (bike.brand || bike.name || '').toLowerCase();
  const color = (bike.color || '').toLowerCase();

  if (brand.includes('ducati') || color.includes('red')) {
    return 'linear-gradient(135deg, #4c0519 0%, #991b1b 50%, #dc2626 100%)';
  }
  if (brand.includes('bmw')) {
    return 'linear-gradient(135deg, #0d2857 0%, #1d4ed8 50%, #2563eb 100%)';
  }
  if (brand.includes('yamaha')) {
    return 'linear-gradient(135deg, #092c63 0%, #1750b3 50%, #1d70f5 100%)';
  }
  if (brand.includes('kawasaki') || color.includes('green')) {
    return 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)';
  }
  if (brand.includes('ktm') || color.includes('orange')) {
    return 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f97316 100%)';
  }
  return 'linear-gradient(135deg, #0d2857 0%, #1d4ed8 50%, #2563eb 100%)';
};

const onImageError = (bike) => {
  bike.image = null;
};

const fetchProducts = async () => {
  productsLoading.value = true;
  productsError.value = '';
  try {
    const res = await productService.getAllProducts();
    if (res && res.result && Array.isArray(res.data)) {
      products.value = res.data;
    } else if (Array.isArray(res?.data)) {
      products.value = res.data;
    } else if (Array.isArray(res)) {
      products.value = res;
    } else {
      products.value = res?.data?.data || [];
    }
  } catch (err) {
    productsError.value = 'Failed to load live fleet data.';
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
   SECTION 2: SHOWROOM FLEET & MACHINE SHOWCASE
════════════════════════════════════════════════════════ */
.showroom-section {
  background: #060b17;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 4.5rem 1.5rem 6rem;
}

/* ── Showroom Header ────────────────────────── */
.showroom-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.25rem;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.showroom-title-group {
  display: flex;
  flex-direction: column;
}

.showroom-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.15;
}

.showroom-subtitle {
  font-size: 0.95rem;
  color: #8fa0ba;
  margin: 0.4rem 0 0 0;
  font-weight: 500;
}

/* ── Showroom Controls (Filters & Sort) ─────── */
.showroom-controls {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.showroom-filter-pills {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-pill {
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  padding: 0.45rem 1.15rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  border-color: rgba(56, 189, 248, 0.4);
  color: #ffffff;
}

.filter-pill.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
}

.showroom-sort-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.showroom-sort-select {
  appearance: none;
  -webkit-appearance: none;
  background: #0d1527;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f1f5f9;
  padding: 0.46rem 2.2rem 0.46rem 1.15rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.showroom-sort-select:hover,
.showroom-sort-select:focus {
  border-color: rgba(56, 189, 248, 0.5);
}

.showroom-sort-select option {
  background: #0b1325;
  color: #ffffff;
}

.sort-chevron {
  position: absolute;
  right: 0.85rem;
  width: 15px;
  height: 15px;
  color: #94a3b8;
  pointer-events: none;
}

/* ── Fleet Grid ─────────────────────────────── */
.fleet-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .fleet-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .fleet-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .fleet-grid {
    grid-template-columns: 1fr;
  }
  .showroom-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ── Showroom Card ──────────────────────────── */
.showroom-card {
  background: #070e1b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.65);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease, border-color 0.28s ease;
}

.showroom-card:hover {
  transform: translateY(-6px);
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.85);
}

/* ── Card Banner ────────────────────────────── */
.card-banner {
  height: 220px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-top-left-radius: 17px;
  border-top-right-radius: 17px;
  overflow: hidden;
  background-color: #070e1b;
}

.card-stock-tag {
  position: absolute;
  top: 0.85rem;
  left: 0.85rem;
  z-index: 3;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.26rem 0.7rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.74rem;
  font-weight: 700;
  color: #ffffff;
}

.stock-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.card-graphic-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-custom-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.5s ease;
}

.showroom-card:hover .card-custom-img {
  transform: scale(1.08);
}

.bike-wireframe-svg {
  width: 84%;
  max-height: 130px;
  color: #ffffff;
  padding: 1rem;
  transition: transform 0.4s ease;
}

.showroom-card:hover .bike-wireframe-svg {
  transform: scale(1.05);
}

/* ── Card Body ──────────────────────────────── */
.card-body {
  padding: 1.25rem 1.25rem 1.35rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-titles {
  margin-bottom: 1.1rem;
}

.bike-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.2rem 0;
  letter-spacing: -0.015em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bike-brand {
  font-size: 0.86rem;
  color: #798ea8;
  margin: 0;
  font-weight: 500;
}

/* ── 2x2 Specs Grid ─────────────────────────── */
.card-specs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 0.95rem;
  column-gap: 1rem;
  margin-bottom: 1.35rem;
}

.spec-cell {
  display: flex;
  flex-direction: column;
}

.spec-lbl {
  font-size: 0.76rem;
  color: #758aa5;
  font-weight: 500;
  margin-bottom: 0.18rem;
}

.spec-val {
  font-size: 0.9rem;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.color-val {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-transform: capitalize;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
}

/* ── Card Bottom: Price & Button ────────────── */
.card-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.5rem;
  gap: 0.75rem;
}

.card-price-group {
  display: flex;
  flex-direction: column;
}

.price-title {
  font-size: 0.74rem;
  color: #758aa5;
  font-weight: 500;
  margin-bottom: 0.15rem;
}

.price-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.btn-view-details {
  background: #38bdf8;
  color: #050d1a;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.6rem 1.15rem;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(56, 189, 248, 0.25);
  white-space: nowrap;
}

.btn-view-details:hover {
  background: #7dd3fc;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(56, 189, 248, 0.4);
}

/* ── Showroom See More Row ───────────────────── */
.showroom-see-more-row {
  display: flex;
  justify-content: center;
  margin-top: 2.25rem;
}

.btn-see-more {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  border-radius: 12px;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 18px rgba(37, 99, 235, 0.35);
  transition: all 0.25s ease;
}

.btn-see-more:hover {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(37, 99, 235, 0.5);
}

.see-more-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.btn-see-more:hover .see-more-icon {
  transform: translateX(4px);
}

/* ── Products API States ────────────────────── */
.products-loading,
.products-error,
.products-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  padding: 5rem 1rem;
  color: #94a3b8;
  font-size: 1rem;
  text-align: center;
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
