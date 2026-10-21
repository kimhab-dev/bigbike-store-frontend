<template>
  <div class="showroom-page">
    <!-- Page Header / Breadcrumb -->
    <div class="showroom-page-header">
      <div class="header-content">
        <nav class="breadcrumb-nav" aria-label="Breadcrumb">
          <router-link to="/" class="bc-link">Home</router-link>
          <span class="bc-sep">/</span>
          <span class="bc-current">Showroom</span>
        </nav>
        <h1 class="page-title">Showroom</h1>
        <p class="page-subtitle">Browse every bike we have on the floor. Filter to find your match.</p>
      </div>
    </div>

    <div class="showroom-body">
      <!-- LEFT SIDEBAR FILTERS -->
      <aside class="filter-sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
        <div class="sidebar-inner">
          <div class="sidebar-header">
            <span class="sidebar-heading">Filters</span>
            <button class="clear-all-btn" @click="clearAllFilters">Clear all</button>
          </div>

          <!-- Type Filter -->
          <div class="filter-group">
            <div class="filter-group-title">Type</div>
            <label
              v-for="type in availableTypes"
              :key="type.value"
              class="filter-checkbox-row"
            >
              <input
                type="checkbox"
                :value="type.value"
                v-model="selectedTypes"
                class="hidden-check"
              />
              <span class="custom-check" :class="{ active: selectedTypes.includes(type.value) }"></span>
              <span class="check-label">{{ type.label }}</span>
              <span class="check-count">{{ type.count }}</span>
            </label>
          </div>

          <!-- Brand Filter -->
          <div class="filter-group">
            <div class="filter-group-title">Brand</div>
            <label
              v-for="brand in availableBrands"
              :key="brand.value"
              class="filter-checkbox-row"
            >
              <input
                type="checkbox"
                :value="brand.value"
                v-model="selectedBrands"
                class="hidden-check"
              />
              <span class="custom-check" :class="{ active: selectedBrands.includes(brand.value) }"></span>
              <span class="check-label">{{ brand.label }}</span>
              <span class="check-count">{{ brand.count }}</span>
            </label>
          </div>

          <!-- Max Price -->
          <div class="filter-group">
            <div class="filter-group-title">Max price</div>
            <div class="price-display">
              <span class="price-min">$0</span>
              <span class="price-current">${{ maxPrice.toLocaleString() }}</span>
            </div>
            <input
              type="range"
              class="price-slider"
              min="0"
              :max="absoluteMaxPrice"
              step="500"
              v-model.number="maxPrice"
            />
            <div class="price-labels">
              <span>$0</span>
              <span>${{ absoluteMaxPrice.toLocaleString() }}+</span>
            </div>
          </div>

          <!-- Stock Filter -->
          <div class="filter-group">
            <div class="filter-group-title">Availability</div>
            <label class="filter-checkbox-row">
              <input type="radio" v-model="stockFilter" value="all" class="hidden-check" />
              <span class="custom-check radio" :class="{ active: stockFilter === 'all' }"></span>
              <span class="check-label">All</span>
            </label>
            <label class="filter-checkbox-row">
              <input type="radio" v-model="stockFilter" value="in_stock" class="hidden-check" />
              <span class="custom-check radio" :class="{ active: stockFilter === 'in_stock' }"></span>
              <span class="check-label">In stock</span>
            </label>
            <label class="filter-checkbox-row">
              <input type="radio" v-model="stockFilter" value="low_stock" class="hidden-check" />
              <span class="custom-check radio" :class="{ active: stockFilter === 'low_stock' }"></span>
              <span class="check-label">Low stock</span>
            </label>
          </div>
        </div>
      </aside>

      <!-- Sidebar backdrop for mobile -->
      <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="isSidebarOpen = false"></div>

      <!-- RIGHT MAIN CONTENT -->
      <div class="showroom-main">
        <!-- Top bar -->
        <div class="main-topbar">
          <div class="topbar-left">
            <button class="mobile-filter-btn" @click="isSidebarOpen = true">
              &#9776; Filters
            </button>

            <div class="search-input-wrap">
              <span class="search-icon-sm">&#128269;</span>
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search by model or brand..."
              />
              <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">&#10005;</button>
            </div>
          </div>

          <div class="topbar-right">
            <div class="sort-wrap">
              <select v-model="sortBy" class="sort-select">
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="engine_desc">Highest CC</option>
                <option value="newest">Newest Year</option>
              </select>
            </div>

            <!-- Grid / List toggle -->
            <div class="view-toggle">
              <button
                class="toggle-btn"
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              >Grid</button>
              <button
                class="toggle-btn"
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
              >List</button>
            </div>
          </div>
        </div>

        <!-- Results count -->
        <div class="results-count">
          <span v-if="!isLoading">
            {{ filteredBikes.length }} bike{{ filteredBikes.length !== 1 ? 's' : '' }} found
          </span>
          <span v-else>Loading fleet...</span>
        </div>

        <!-- Loading skeleton -->
        <div v-if="isLoading" class="bikes-grid">
          <div v-for="n in 8" :key="n" class="bike-card skeleton-card">
            <div class="skeleton-banner"></div>
            <div class="skeleton-body">
              <div class="skeleton-line wide"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-line medium"></div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredBikes.length === 0" class="empty-state">
          <span class="empty-icon">&#127949;</span>
          <h3>No bikes found</h3>
          <p>Try adjusting your filters or search query.</p>
          <button class="reset-btn" @click="clearAllFilters">Reset all filters</button>
        </div>

        <!-- Bike cards grid or list -->
        <div v-else class="bikes-grid" :class="{ 'list-mode': viewMode === 'list' }">
          <div
            v-for="bike in filteredBikes"
            :key="bike.id"
            class="bike-card"
            :class="{ 'bike-card-list': viewMode === 'list' }"
          >
            <!-- Card Banner -->
            <div class="bike-card-banner" :style="{ background: getCardGradient(bike) }">
              <!-- Stock badge -->
              <div class="stock-badge" :class="getStockBadgeClass(bike.stock)">
                <span class="stock-dot-sm"></span>
                {{ getStockText(bike.stock) }}
              </div>

              <!-- Wishlist heart -->
              <button
                class="wish-btn"
                :class="{ wishlisted: wishlist.has(bike.id) }"
                @click.stop="toggleWishlist(bike.id)"
              >
                {{ wishlist.has(bike.id) ? '&#10084;' : '&#9825;' }}
              </button>

              <!-- Bike graphic -->
              <div class="card-img-wrap">
                <img
                  v-if="bike.image"
                  :src="getProductImageUrl(bike.image)"
                  :alt="bike.name"
                  class="card-product-img"
                  @error="bike.image = null"
                />
                <svg
                  v-else
                  class="bike-wireframe"
                  viewBox="0 0 540 280"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="110" cy="210" r="58" stroke="#ffffff" stroke-width="4.5" />
                  <circle cx="110" cy="210" r="14" stroke="#ffffff" stroke-width="4.5" />
                  <circle cx="430" cy="210" r="58" stroke="#ffffff" stroke-width="4.5" />
                  <circle cx="430" cy="210" r="14" stroke="#ffffff" stroke-width="4.5" />
                  <path d="M110 210 L230 208 L260 150" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M110 210 L195 150" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M195 150 L260 150 L315 208 L375 208" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M230 208 L300 208 L345 150" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M160 120 L230 150 L295 150 L330 95 L375 90 L345 150 L390 210" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M160 120 L220 120 L275 150" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M375 90 L430 210" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M330 95 L375 90" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M190 185 L160 120" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>

            <!-- Card Body -->
            <div class="bike-card-body">
              <div class="bike-name-row">
                <h3 class="bike-name">{{ bike.name }}</h3>
                <span class="bike-brand-badge">{{ bike.brand }}</span>
              </div>

              <div class="bike-meta-row">
                <span class="meta-chip">{{ bike.brand }}</span>
                <span class="meta-sep">·</span>
                <span class="meta-chip">{{ bike.year || 2026 }}</span>
                <span class="meta-sep">·</span>
                <span class="meta-chip">{{ bike.engine || 999 }} cc</span>
              </div>

              <!-- Specs row for list mode -->
              <div v-if="viewMode === 'list'" class="list-specs-row">
                <div class="list-spec">
                  <span class="ls-label">Engine</span>
                  <span class="ls-val">{{ bike.engine || 999 }} cc</span>
                </div>
                <div class="list-spec">
                  <span class="ls-label">Year</span>
                  <span class="ls-val">{{ bike.year || 2026 }}</span>
                </div>
                <div class="list-spec">
                  <span class="ls-label">Color</span>
                  <span class="ls-val">
                    <span class="color-dot-sm" :style="{ backgroundColor: getColorDot(bike.color) }"></span>
                    {{ bike.color || 'White' }}
                  </span>
                </div>
                <div class="list-spec">
                  <span class="ls-label">Stock</span>
                  <span class="ls-val">{{ bike.stock ?? 0 }} units</span>
                </div>
              </div>

              <div class="card-footer-row">
                <span class="card-price">${{ Number(bike.price || 0).toLocaleString() }}</span>
                <router-link
                  :to="authStore.isAuthenticated ? `/products/${bike.id}` : `/login?redirect=/products/${bike.id}`"
                  class="view-btn"
                >
                  View details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import productService from '@/services/productService';

const authStore = useAuthStore();

const isLoading = ref(false);
const products = ref([]);
const searchQuery = ref('');
const sortBy = ref('featured');
const viewMode = ref('grid');
const stockFilter = ref('all');
const isSidebarOpen = ref(false);
const selectedTypes = ref([]);
const selectedBrands = ref([]);
const maxPrice = ref(50000);
const absoluteMaxPrice = ref(50000);
const wishlist = ref(new Set());

const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const res = await productService.getAllProducts();
    let list = [];
    if (res && Array.isArray(res.data)) {
      list = res.data;
    } else if (Array.isArray(res)) {
      list = res;
    } else if (res?.data?.data) {
      list = res.data.data;
    }
    products.value = list;
    if (list.length > 0) {
      const mx = Math.max(...list.map((p) => Number(p.price || 0)));
      absoluteMaxPrice.value = mx > 0 ? Math.ceil(mx / 1000) * 1000 : 50000;
      maxPrice.value = absoluteMaxPrice.value;
    }
  } catch (e) {
    products.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchProducts);

const normalizedBikes = computed(() => {
  return products.value.map((p) => {
    const rawName = p.name || 'BigBike Model';
    let brand = p.brand;
    if (!brand) {
      const n = rawName.toLowerCase();
      if (n.includes('yamaha') || n.includes('yamamha')) brand = 'Yamaha';
      else if (n.includes('bmw')) brand = 'BMW';
      else if (n.includes('ducati')) brand = 'Ducati';
      else if (n.includes('kawasaki')) brand = 'Kawasaki';
      else if (n.includes('honda')) brand = 'Honda';
      else if (n.includes('suzuki')) brand = 'Suzuki';
      else if (n.includes('triumph')) brand = 'Triumph';
      else if (n.includes('ktm')) brand = 'KTM';
      else if (p.category?.name) brand = p.category.name;
      else brand = rawName.split(' ')[0] || 'BigBike';
    }

    let category = p.category?.name || '';
    let type = 'Sport';
    const catLower = category.toLowerCase();
    if (catLower.includes('adventure') || catLower.includes('touring')) type = 'Adventure';
    else if (catLower.includes('cruiser') || catLower.includes('naked')) type = 'Cruiser';

    return {
      id: p.id,
      name: rawName,
      brand,
      engine: p.engince != null ? Number(p.engince) : (p.engine != null ? Number(p.engine) : 999),
      year: p.year || 2026,
      color: p.color ? p.color.charAt(0).toUpperCase() + p.color.slice(1) : 'White',
      stock: Number(p.stock ?? 0),
      price: Number(p.price || 0),
      image: p.image || null,
      category: category || type,
      type,
    };
  });
});

const availableTypes = computed(() => {
  const counts = {};
  normalizedBikes.value.forEach((b) => {
    counts[b.type] = (counts[b.type] || 0) + 1;
  });
  return Object.entries(counts).map(([label, count]) => ({ label, value: label, count }));
});

const availableBrands = computed(() => {
  const counts = {};
  normalizedBikes.value.forEach((b) => {
    counts[b.brand] = (counts[b.brand] || 0) + 1;
  });
  return Object.entries(counts).map(([label, count]) => ({ label, value: label, count }));
});

const filteredBikes = computed(() => {
  let list = [...normalizedBikes.value];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (b) => b.name.toLowerCase().includes(q) || b.brand.toLowerCase().includes(q)
    );
  }

  if (selectedTypes.value.length > 0) {
    list = list.filter((b) => selectedTypes.value.includes(b.type));
  }

  if (selectedBrands.value.length > 0) {
    list = list.filter((b) => selectedBrands.value.includes(b.brand));
  }

  list = list.filter((b) => b.price <= maxPrice.value);

  if (stockFilter.value === 'in_stock') {
    list = list.filter((b) => b.stock > 0);
  } else if (stockFilter.value === 'low_stock') {
    list = list.filter((b) => b.stock > 0 && b.stock <= 3);
  }

  if (sortBy.value === 'price_asc') list.sort((a, b) => a.price - b.price);
  else if (sortBy.value === 'price_desc') list.sort((a, b) => b.price - a.price);
  else if (sortBy.value === 'engine_desc') list.sort((a, b) => b.engine - a.engine);
  else if (sortBy.value === 'newest') list.sort((a, b) => b.year - a.year);

  return list;
});

const getProductImageUrl = (imgPath) => {
  if (!imgPath) return '';
  if (imgPath.startsWith('http') || imgPath.startsWith('blob:') || imgPath.startsWith('data:')) return imgPath;
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${apiBase}/${imgPath.replace(/^\//, '')}`;
};

const getCardGradient = (bike) => {
  const brand = (bike.brand || '').toLowerCase();
  const color = (bike.color || '').toLowerCase();
  if (brand.includes('ducati') || color.includes('red')) return 'linear-gradient(135deg, #4c0519 0%, #991b1b 60%, #dc2626 100%)';
  if (brand.includes('bmw')) return 'linear-gradient(135deg, #0d2857 0%, #1d4ed8 60%, #2563eb 100%)';
  if (brand.includes('yamaha')) return 'linear-gradient(135deg, #092c63 0%, #1750b3 60%, #1d70f5 100%)';
  if (brand.includes('kawasaki') || color.includes('green')) return 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #10b981 100%)';
  if (brand.includes('ktm') || color.includes('orange')) return 'linear-gradient(135deg, #7c2d12 0%, #ea580c 60%, #f97316 100%)';
  if (brand.includes('triumph')) return 'linear-gradient(135deg, #3b0764 0%, #7c3aed 60%, #a855f7 100%)';
  if (brand.includes('honda')) return 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 60%, #ef4444 100%)';
  return 'linear-gradient(135deg, #0f172a 0%, #1e40af 60%, #2563eb 100%)';
};

const getStockText = (stock) => {
  const s = Number(stock ?? 0);
  if (s <= 0) return 'Sold out';
  if (s <= 2) return `Only ${s} left`;
  return 'In stock';
};

const getStockBadgeClass = (stock) => {
  const s = Number(stock ?? 0);
  if (s <= 0) return 'badge-out';
  if (s <= 2) return 'badge-low';
  return 'badge-in';
};

const getColorDot = (color) => {
  if (!color) return '#ffffff';
  const c = color.toLowerCase();
  if (c.includes('red')) return '#ef4444';
  if (c.includes('white')) return '#f1f5f9';
  if (c.includes('black')) return '#1e293b';
  if (c.includes('blue')) return '#3b82f6';
  if (c.includes('green')) return '#10b981';
  if (c.includes('orange')) return '#f97316';
  if (c.includes('silver') || c.includes('gray') || c.includes('grey')) return '#94a3b8';
  return '#64748b';
};

const toggleWishlist = (id) => {
  const set = new Set(wishlist.value);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  wishlist.value = set;
};

const clearAllFilters = () => {
  searchQuery.value = '';
  selectedTypes.value = [];
  selectedBrands.value = [];
  stockFilter.value = 'all';
  maxPrice.value = absoluteMaxPrice.value;
};
</script>

<style scoped>
* { box-sizing: border-box; }

.showroom-page {
  min-height: 100vh;
  background: #070a12;
  color: #f8fafc;
  font-family: 'Inter', 'Outfit', system-ui, sans-serif;
}

/* Page Header */
.showroom-page-header {
  background: linear-gradient(180deg, #0d1117 0%, #070a12 100%);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 1.75rem 2rem 2rem;
}
.header-content { max-width: 1480px; margin: 0 auto; }

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}
.bc-link { color: #64748b; text-decoration: none; transition: color 0.15s; }
.bc-link:hover { color: #38bdf8; }
.bc-sep { color: #334155; }
.bc-current { color: #94a3b8; font-weight: 600; }

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 0.35rem;
  letter-spacing: -0.03em;
}
.page-subtitle { font-size: 0.9rem; color: #64748b; margin: 0; }

/* Body layout */
.showroom-body {
  display: flex;
  max-width: 1480px;
  margin: 0 auto;
  padding: 2rem;
  gap: 2rem;
  align-items: flex-start;
}

/* Sidebar */
.filter-sidebar {
  width: 230px;
  min-width: 230px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}
.sidebar-inner {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}
.sidebar-heading { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
.clear-all-btn {
  font-size: 0.78rem; color: #38bdf8; background: none;
  border: none; cursor: pointer; padding: 0; transition: opacity 0.15s;
}
.clear-all-btn:hover { opacity: 0.7; }

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.85rem 0 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.filter-group-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.25rem;
}
.filter-checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  padding: 0.18rem 0;
}
.filter-checkbox-row:hover { opacity: 0.8; }
.hidden-check { display: none; }

.custom-check {
  width: 16px; height: 16px; border-radius: 4px;
  border: 1.5px solid #334155; background: transparent;
  flex-shrink: 0; transition: all 0.15s; position: relative;
}
.custom-check.radio { border-radius: 50%; }
.custom-check.active { background: #38bdf8; border-color: #38bdf8; }
.custom-check.active::after {
  content: '';
  position: absolute;
  top: 3px; left: 2.5px;
  width: 8px; height: 5px;
  border-left: 2px solid #0a0f1a;
  border-bottom: 2px solid #0a0f1a;
  transform: rotate(-45deg);
}
.custom-check.radio.active::after {
  width: 6px; height: 6px; border-radius: 50%;
  background: #0a0f1a; border: none;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
.check-label { font-size: 0.83rem; color: #cbd5e1; flex: 1; }
.check-count {
  font-size: 0.73rem; color: #475569;
  background: rgba(71,85,105,0.2); border-radius: 10px;
  padding: 0.05rem 0.4rem;
}

/* Price Slider */
.price-display {
  display: flex; justify-content: space-between;
  font-size: 0.78rem; color: #94a3b8; margin-bottom: 0.5rem;
}
.price-current { color: #38bdf8; font-weight: 700; }
.price-slider {
  width: 100%; -webkit-appearance: none;
  height: 4px; border-radius: 4px;
  background: #1e293b; outline: none; cursor: pointer;
}
.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px; height: 16px; border-radius: 50%;
  background: #38bdf8; border: 2px solid #0d1117;
  box-shadow: 0 0 6px rgba(56,189,248,0.4); cursor: pointer;
}
.price-labels {
  display: flex; justify-content: space-between;
  font-size: 0.7rem; color: #475569; margin-top: 0.35rem;
}

/* Mobile sidebar */
.sidebar-backdrop {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65); z-index: 48;
}

/* Main Content */
.showroom-main { flex: 1; min-width: 0; }

.main-topbar {
  display: flex; align-items: center;
  justify-content: space-between;
  gap: 1rem; flex-wrap: wrap;
  margin-bottom: 1rem;
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 0.75rem 1rem;
}
.topbar-left {
  display: flex; align-items: center;
  gap: 0.65rem; flex: 1; min-width: 0;
}
.mobile-filter-btn {
  display: none;
  align-items: center; gap: 0.4rem;
  background: rgba(56,189,248,0.1);
  border: 1px solid rgba(56,189,248,0.3);
  color: #38bdf8; border-radius: 8px;
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem; font-weight: 600;
  cursor: pointer; white-space: nowrap;
}
.search-input-wrap { position: relative; flex: 1; min-width: 180px; }
.search-icon-sm {
  position: absolute; left: 0.75rem; top: 50%;
  transform: translateY(-50%); color: #475569; font-size: 0.82rem;
}
.search-input {
  width: 100%;
  background: rgba(30,41,59,0.6);
  border: 1px solid rgba(71,85,105,0.4);
  border-radius: 8px; color: #f8fafc;
  font-size: 0.85rem;
  padding: 0.45rem 2.2rem;
  outline: none; transition: border-color 0.2s;
}
.search-input::placeholder { color: #475569; }
.search-input:focus { border-color: #38bdf8; }
.clear-search {
  position: absolute; right: 0.65rem; top: 50%;
  transform: translateY(-50%); background: none;
  border: none; color: #64748b; cursor: pointer; padding: 0;
}

.topbar-right { display: flex; align-items: center; gap: 0.75rem; }
.sort-select {
  background: rgba(30,41,59,0.7);
  border: 1px solid rgba(71,85,105,0.4);
  border-radius: 8px; color: #cbd5e1;
  font-size: 0.82rem;
  padding: 0.45rem 1.5rem 0.45rem 0.75rem;
  outline: none; cursor: pointer;
}
.sort-select option { background: #0d1117; }

.view-toggle {
  display: flex;
  border: 1px solid rgba(71,85,105,0.4);
  border-radius: 8px; overflow: hidden;
}
.toggle-btn {
  padding: 0.42rem 0.85rem; background: transparent;
  border: none; color: #64748b;
  font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.toggle-btn.active { background: rgba(56,189,248,0.15); color: #38bdf8; }

.results-count { font-size: 0.82rem; color: #64748b; margin-bottom: 1.25rem; }

/* Bikes Grid */
.bikes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.bikes-grid.list-mode {
  grid-template-columns: 1fr;
  gap: 0.9rem;
}

/* Bike Card */
.bike-card {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px; overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.bike-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.2);
  border-color: rgba(56,189,248,0.25);
}
.bike-card-banner {
  position: relative;
  height: 200px;
  overflow: hidden;
}

/* Stock badge */
.stock-badge {
  position: absolute; top: 0.75rem; left: 0.75rem;
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.25rem 0.6rem; border-radius: 20px;
  backdrop-filter: blur(8px);
}
.badge-in { background: rgba(22,163,74,0.25); color: #86efac; border: 1px solid rgba(22,163,74,0.4); }
.badge-low { background: rgba(202,138,4,0.25); color: #fde68a; border: 1px solid rgba(202,138,4,0.4); }
.badge-out { background: rgba(220,38,38,0.25); color: #fca5a5; border: 1px solid rgba(220,38,38,0.4); }
.stock-dot-sm { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

.wish-btn {
  position: absolute; top: 0.75rem; right: 0.75rem;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(0,0,0,0.35); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.12);
  color: #94a3b8; display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all 0.2s;
  font-size: 1rem; line-height: 1;
}
.wish-btn:hover, .wish-btn.wishlisted {
  color: #f43f5e; border-color: rgba(244,63,94,0.4);
  background: rgba(244,63,94,0.15);
}
.card-img-wrap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.card-product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.4s ease;
}
.bike-card:hover .card-product-img { transform: scale(1.06); }
.bike-wireframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  opacity: 0.85;
  transition: opacity 0.3s;
}
.bike-card:hover .bike-wireframe { opacity: 1; }

/* Card Body */
.bike-card-body { padding: 1rem; }
.bike-name-row {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 0.5rem; margin-bottom: 0.35rem;
}
.bike-name { font-size: 1rem; font-weight: 800; color: #f1f5f9; margin: 0; line-height: 1.3; }
.bike-brand-badge {
  font-size: 0.65rem; font-weight: 700; color: #38bdf8;
  background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25);
  border-radius: 6px; padding: 0.12rem 0.45rem; white-space: nowrap; flex-shrink: 0;
}
.bike-meta-row {
  display: flex; align-items: center; flex-wrap: wrap;
  gap: 0.2rem; margin-bottom: 0.85rem;
}
.meta-chip { font-size: 0.72rem; color: #64748b; }
.meta-sep { color: #334155; font-size: 0.72rem; }

.card-footer-row {
  display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
}
.card-price { font-size: 1.25rem; font-weight: 800; color: #f1f5f9; }
.view-btn {
  padding: 0.42rem 1rem; background: #2563eb; color: #ffffff;
  border-radius: 8px; font-size: 0.8rem; font-weight: 700;
  text-decoration: none; transition: background 0.2s, transform 0.15s; white-space: nowrap;
}
.view-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

/* List mode */
.bike-card-list { display: flex; flex-direction: row; align-items: stretch; }
.bike-card-list .bike-card-banner { width: 240px; min-width: 240px; min-height: 160px; flex-shrink: 0; }
.bike-card-list .bike-card-body {
  flex: 1; display: flex; flex-direction: column; justify-content: space-between;
  padding: 1.15rem 1.25rem;
}
.list-specs-row { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 0.85rem; }
.list-spec { display: flex; flex-direction: column; gap: 0.15rem; }
.ls-label {
  font-size: 0.68rem; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
}
.ls-val { font-size: 0.85rem; font-weight: 700; color: #e2e8f0; display: flex; align-items: center; gap: 0.35rem; }
.color-dot-sm {
  width: 10px; height: 10px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0;
}

/* Skeleton */
.skeleton-card { pointer-events: none; }
.skeleton-banner {
  height: 180px;
  background: linear-gradient(90deg, #0d1117 25%, #1e293b 50%, #0d1117 75%);
  background-size: 400% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
.skeleton-line {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, #0d1117 25%, #1e293b 50%, #0d1117 75%);
  background-size: 400% 100%; animation: shimmer 1.5s infinite;
}
.skeleton-line.wide { width: 80%; }
.skeleton-line.medium { width: 60%; }
.skeleton-line.short { width: 40%; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty State */
.empty-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.75rem; padding: 4rem 2rem;
  text-align: center; color: #64748b;
}
.empty-icon { font-size: 3rem; }
.empty-state h3 { font-size: 1.15rem; font-weight: 700; color: #94a3b8; margin: 0; }
.empty-state p { font-size: 0.88rem; margin: 0; }
.reset-btn {
  padding: 0.5rem 1.5rem; background: #2563eb; color: #fff;
  border: none; border-radius: 8px;
  font-weight: 700; font-size: 0.85rem;
  cursor: pointer; transition: background 0.2s;
}
.reset-btn:hover { background: #1d4ed8; }

/* Responsive */
@media (max-width: 1200px) { .bikes-grid { grid-template-columns: repeat(2, 1fr); } }

@media (max-width: 900px) {
  .showroom-body { padding: 1.25rem; }
  .filter-sidebar {
    position: fixed; left: -100%; top: 0; bottom: 0;
    width: 280px; z-index: 49; transition: left 0.3s ease;
    background: #0d1117; overflow-y: auto; padding: 1.25rem;
  }
  .filter-sidebar.sidebar-open { left: 0; }
  .sidebar-inner { border: none; padding: 0; }
  .sidebar-backdrop { display: block; }
  .mobile-filter-btn { display: inline-flex; }
}

@media (max-width: 640px) {
  .showroom-page-header { padding: 1.25rem 1rem; }
  .showroom-body { padding: 1rem; gap: 0; }
  .page-title { font-size: 1.5rem; }
  .bikes-grid { grid-template-columns: 1fr; }
  .bike-card-list { flex-direction: column; }
  .bike-card-list .bike-card-banner { width: 100%; min-width: unset; height: 180px; }
  .main-topbar { flex-direction: column; align-items: stretch; }
  .topbar-right { justify-content: flex-end; }
}
</style>
