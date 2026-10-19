<template>
  <div class="product-detail-page">
    <div class="bg-glow glow-1"></div>
    <div class="bg-glow glow-2"></div>

    <!-- Back navigation -->
    <div class="top-nav">
      <button class="back-btn" @click="router.back()">
        <i class="fa fa-arrow-left"></i>
        <span>Back to Showroom</span>
      </button>
    </div>

    <!-- ── Loading ───────────────────────────── -->
    <div v-if="loading" class="state-center">
      <div class="state-spinner"></div>
      <p>Loading product details...</p>
    </div>

    <!-- ── Error ─────────────────────────────── -->
    <div v-else-if="error" class="state-center">
      <div class="state-icon error-icon">
        <i class="fa fa-exclamation-triangle"></i>
      </div>
      <h3>Failed to Load Product</h3>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchProduct">
        <i class="fa fa-refresh"></i> Retry
      </button>
    </div>

    <!-- ── Product Detail ─────────────────────── -->
    <div v-else-if="product" class="detail-wrapper">
      <div class="detail-grid">

        <!-- Left: Image -->
        <div class="image-panel">
          <div class="image-frame">
            <ProductImage
              :src="product.image"
              :alt="product.name"
              img-class="product-main-img"
            />
            <div class="stock-badge" :class="product.stock > 0 ? 'in-stock' : 'out-stock'">
              {{ product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock' }}
            </div>
          </div>

          <!-- Product ID chip -->
          <div class="product-id-chip">
            <span class="chip-label">PRODUCT ID</span>
            <span class="chip-val">#{{ product.id }}</span>
          </div>
        </div>

        <!-- Right: Info -->
        <div class="info-panel">
          <div class="product-badge">
            <span class="pulse-dot"></span>
            <span>PREMIUM MACHINE</span>
          </div>

          <h1 class="product-name">{{ product.name }}</h1>

          <p class="product-description">
            {{ product.description || 'A premium BigBike Store exclusive — engineered for the road and the track.' }}
          </p>

          <!-- Price -->
          <div class="price-block">
            <span class="price-label">Price</span>
            <span class="price-value">{{ formatPrice(product.price) }}</span>
          </div>

          <!-- Metadata -->
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-k">Model Year</span>
              <span class="meta-v">{{ product.year || '2026' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-k">Displacement</span>
              <span class="meta-v text-cyan">{{ (product.engince || product.engine) ? `${product.engince || product.engine} cc` : '999 cc' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-k">Color</span>
              <span class="meta-v color-meta">
                <span class="color-dot-inline" :style="{ backgroundColor: product.color || '#ffffff' }"></span>
                <span>{{ product.color || 'White' }}</span>
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-k">Category</span>
              <span class="meta-v">{{ categoryName }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-k">Stock Status</span>
              <span class="meta-v" :class="product.stock > 0 ? 'text-green' : 'text-red'">
                {{ product.stock > 0 ? `${product.stock} Units Available` : 'Sold Out' }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-k">Listed</span>
              <span class="meta-v">{{ formatDate(product.createdAt) }}</span>
            </div>
          </div>

          <!-- Order form -->
          <div class="order-section">
            <div class="order-qty-row">
              <label class="qty-label">Quantity</label>
              <div class="qty-control">
                <button class="qty-btn" @click="qty = Math.max(1, qty - 1)" :disabled="qty <= 1">−</button>
                <input
                  v-model.number="qty"
                  type="number"
                  min="1"
                  :max="product.stock"
                  class="qty-input"
                  @change="qty = Math.min(product.stock, Math.max(1, qty))"
                />
                <button class="qty-btn" @click="qty = Math.min(product.stock, qty + 1)" :disabled="qty >= product.stock">+</button>
              </div>
            </div>

            <div class="order-total">
              <span class="total-label">Order Total</span>
              <span class="total-value">{{ formatPrice(Number(product.price) * qty) }}</span>
            </div>

            <button
              class="order-btn"
              :disabled="product.stock === 0 || ordering"
              @click="placeOrder"
            >
              <span v-if="ordering" class="btn-spinner-wrap">
                <span class="btn-spinner"></span>
                <span>Processing Order...</span>
              </span>
              <span v-else-if="product.stock === 0">Currently Unavailable</span>
              <span v-else class="btn-inner">
                <i class="fa fa-shopping-cart"></i>
                Place Order — {{ formatPrice(Number(product.price) * qty) }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Order Success Modal ────────────────── -->
    <transition name="modal-fade">
      <div v-if="orderSuccess" class="success-overlay" @click.self="orderSuccess = false">
        <div class="success-modal">
          <div class="success-icon-ring">
            <i class="fa fa-check"></i>
          </div>
          <h2>Order Placed!</h2>
          <p class="success-desc">Your order for <strong>{{ product?.name }}</strong> has been placed successfully. Our team will contact you shortly.</p>

          <div class="success-details" v-if="lastOrderId">
            <div class="detail-row">
              <span>Order ID</span>
              <span>#{{ lastOrderId }}</span>
            </div>
            <div class="detail-row">
              <span>Quantity</span>
              <span>{{ lastQty }} unit(s)</span>
            </div>
            <div class="detail-row">
              <span>Total</span>
              <strong>{{ lastTotal }}</strong>
            </div>
          </div>

          <div class="success-actions">
            <button class="success-btn-primary" @click="goMyOrders">
              <i class="fa fa-shopping-bag"></i> View My Orders
            </button>
            <button class="success-btn-secondary" @click="goHome">
              <i class="fa fa-arrow-left"></i> Back to Showroom
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import productService from '@/services/productService';
import orderService from '@/services/orderService';
import categoryService from '@/services/categoryService';
import ProductImage from '@/components/ProductImage.vue';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// ── State ────────────────────────────────────────
const product = ref(null);
const categories = ref([]);
const loading = ref(true);
const error = ref('');
const qty = ref(1);
const ordering = ref(false);
const orderSuccess = ref(false);
const lastOrderId = ref(null);
const lastQty = ref(1);
const lastTotal = ref('');

// ── Helpers ──────────────────────────────────────
const categoryName = computed(() => {
  const catId = product.value?.category_id;
  if (!catId) return 'Superbike';
  const found = categories.value.find((c) => Number(c.id) === Number(catId));
  return found ? found.name : `Cat #${catId}`;
});

const formatPrice = (p) => {
  if (p == null) return 'Contact us';
  return '$' + Number(p).toLocaleString('en-US', { minimumFractionDigits: 0 });
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ── Fetch Product ────────────────────────────────
const fetchProduct = async () => {
  const productId = route.params.id;
  loading.value = true;
  error.value = '';
  try {
    const res = await productService.getProductById(productId);
    // Handle { result, message, data: {...} }
    product.value = res?.data?.data ?? res?.data ?? res;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Failed to load product.';
    error.value = typeof msg === 'object' ? (msg.message || JSON.stringify(msg)) : msg;
  } finally {
    loading.value = false;
  }
};

// ── Place Order ──────────────────────────────────
const placeOrder = async () => {
  if (!authStore.isAuthenticated) {
    router.push(`/login?redirect=/products/${product.value.id}`);
    return;
  }

  if (product.value.stock < qty.value) {
    toast.warning('Not enough stock available.', 'Stock Error');
    return;
  }

  ordering.value = true;
  try {
    // API expects: { items: [{ productId, quantity }] }
    const payload = {
      items: [{ productId: product.value.id, quantity: qty.value }],
    };
    const res = await orderService.createOrder(payload);
    const orderData = res?.data?.data ?? res?.data ?? res;

    lastOrderId.value = orderData?.id ?? null;
    lastQty.value = qty.value;
    lastTotal.value = formatPrice(Number(product.value.price) * qty.value);
    orderSuccess.value = true;
    toast.success('Order placed successfully!', 'Order Confirmed');
  } catch (err) {
    const data = err.response?.data;
    let rawMsg = data?.message || data?.error || err.message || 'Failed to place order.';
    if (typeof rawMsg === 'object' && rawMsg !== null) {
      rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
    }
    const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
    toast.error(msg, 'Order Failed');
  } finally {
    ordering.value = false;
  }
};

const goMyOrders = () => {
  orderSuccess.value = false;
  router.push('/orders');
};

const goHome = () => {
  orderSuccess.value = false;
  router.push('/');
};

// ── Boot ─────────────────────────────────────────
onMounted(async () => {
  fetchProduct();
  if (authStore.isAdmin) {
    try {
      const res = await categoryService.getAllCategories();
      const payload = res?.data ?? res;
      categories.value = Array.isArray(payload) ? payload : (payload?.data ?? []);
    } catch (e) {
      // Ignored for non-admin or failed fetch
    }
  }
});
</script>

<style scoped>
* { box-sizing: border-box; }

.product-detail-page {
  position: relative;
  min-height: 100vh;
  background: #070a12;
  color: #f8fafc;
  font-family: 'Inter', system-ui, sans-serif;
  overflow-x: hidden;
  padding: 0 1.5rem 5rem;
}

/* ── Background glows ─────────────────────────── */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(140px);
  opacity: 0.15;
  z-index: 0;
}

.glow-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #0284c7, transparent 70%);
  top: -80px;
  left: -80px;
}

.glow-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #7c3aed, transparent 70%);
  bottom: 100px;
  right: -80px;
}

/* ── Top Nav ──────────────────────────────────── */
.top-nav {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0 1rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255,255,255,0.12);
  color: #f8fafc;
}

.back-btn svg { width: 1.1rem; height: 1.1rem; }

/* ── State (loading / error) ──────────────────── */
.state-center {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1.25rem;
  text-align: center;
  color: #94a3b8;
}

.state-spinner {
  width: 52px;
  height: 52px;
  border: 3px solid rgba(255,255,255,0.08);
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.state-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon {
  background: rgba(244,63,94,0.12);
  border: 2px solid rgba(251,113,133,0.4);
  color: #fb7185;
}

.state-icon svg { width: 32px; height: 32px; }

.state-center h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.retry-btn {
  background: rgba(14,165,233,0.15);
  border: 1px solid rgba(56,189,248,0.4);
  color: #38bdf8;
  padding: 0.6rem 1.4rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.retry-btn:hover { background: rgba(14,165,233,0.3); }

/* ── Detail Grid ──────────────────────────────── */
.detail-wrapper {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 900px) {
  .detail-grid { grid-template-columns: 1fr; }
}

/* ── Image Panel ──────────────────────────────── */
.image-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-frame {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255,255,255,0.08);
  aspect-ratio: 4/3;
}

:deep(.product-main-img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.image-frame:hover :deep(.product-main-img) {
  transform: scale(1.04);
}

.stock-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.3rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  backdrop-filter: blur(8px);
}

.stock-badge.in-stock {
  background: rgba(16,185,129,0.2);
  border: 1px solid rgba(52,211,153,0.4);
  color: #34d399;
}

.stock-badge.out-stock {
  background: rgba(244,63,94,0.2);
  border: 1px solid rgba(251,113,133,0.4);
  color: #fb7185;
}

.product-id-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
}

.chip-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #64748b;
  text-transform: uppercase;
}

.chip-val {
  font-size: 1rem;
  font-weight: 700;
  color: #38bdf8;
}

/* ── Info Panel ───────────────────────────────── */
.info-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(14,165,233,0.12);
  border: 1px solid rgba(56,189,248,0.3);
  color: #38bdf8;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  width: fit-content;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.product-name {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #ffffff;
  line-height: 1.15;
  margin: 0;
}

.product-description {
  font-size: 1rem;
  color: #94a3b8;
  line-height: 1.7;
  margin: 0;
}

/* ── Price Block ─────────────────────────────── */
.price-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(14,165,233,0.08);
  border: 1px solid rgba(56,189,248,0.2);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
}

.price-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #64748b;
  text-transform: uppercase;
}

.price-value {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

/* ── Meta Grid ───────────────────────────────── */
.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem;
  background: rgba(15,23,42,0.8);
}

.meta-k {
  font-size: 0.7rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.meta-v {
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
}

.text-green { color: #34d399 !important; }
.text-red { color: #fb7185 !important; }
.text-cyan { color: #38bdf8 !important; }

.color-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.color-dot-inline {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
}

/* ── Order Section ───────────────────────────── */
.order-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem;
  background: rgba(15,23,42,0.75);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
}

.order-qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qty-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #cbd5e1;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-family: inherit;
}

.qty-btn:hover:not(:disabled) { background: rgba(255,255,255,0.16); }
.qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.qty-input {
  width: 64px;
  text-align: center;
  background: rgba(7,10,18,0.8);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
  padding: 0.45rem 0.5rem;
  font-family: inherit;
}

.qty-input:focus {
  outline: none;
  border-color: #38bdf8;
}

.order-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.total-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #38bdf8;
}

.order-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 8px 24px -4px rgba(14,165,233,0.5);
  transition: all 0.25s ease;
}

.order-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -4px rgba(14,165,233,0.65);
}

.order-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #1e293b;
  box-shadow: none;
}

.btn-inner, .btn-spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.btn-inner svg { width: 1.15rem; height: 1.15rem; }

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ── Success Modal ───────────────────────────── */
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 10, 18, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.success-modal {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  max-width: 440px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  text-align: center;
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.7);
  animation: modalPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}

.success-icon-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(16,185,129,0.15);
  border: 2px solid rgba(52,211,153,0.4);
  color: #34d399;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon-ring svg { width: 36px; height: 36px; }

.success-modal h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
}

.success-desc {
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
}

.success-desc strong { color: #38bdf8; }

.success-details {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  overflow: hidden;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.25rem;
  font-size: 0.875rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.detail-row:last-child { border-bottom: none; }

.detail-row span:first-child { color: #64748b; }
.detail-row span:last-child, .detail-row strong { color: #f8fafc; font-weight: 600; }

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.success-btn-primary {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(135deg, #0284c7, #38bdf8);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.success-btn-primary:hover { opacity: 0.9; }

.success-btn-secondary {
  width: 100%;
  padding: 0.85rem;
  background: transparent;
  color: #64748b;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.success-btn-secondary:hover {
  background: rgba(255,255,255,0.06);
  color: #cbd5e1;
}

/* ── Modal Transition ────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
