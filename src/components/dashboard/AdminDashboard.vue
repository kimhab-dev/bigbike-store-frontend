<template>
  <div class="admin-portal">
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileMenuOpen" class="sidebar-backdrop" @click="isMobileMenuOpen = false"></div>

    <!-- ── 1. LEFT SIDEBAR ──────────────────────────────────────── -->
    <aside class="admin-sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
      <!-- Brand & Title -->
      <div class="sidebar-brand">
        <div class="brand-logo-wrap">
          <i class="fa fa-motorcycle logo-emoji"></i>
          <div class="brand-text">
            <span class="brand-title">BigBike <span class="brand-highlight">ADMIN</span></span>
            <span class="brand-sub">Command & Control</span>
          </div>
        </div>
        <button class="mobile-close-btn" @click="isMobileMenuOpen = false">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Admin Identity Card -->
      <div class="admin-profile-card">
        <div class="admin-avatar">
          <img v-if="authStore.userAvatar" :src="orderAvatarUrl(authStore.userAvatar)"
            :alt="`${authStore.userName} avatar`" @error="$event.target.style.display = 'none'" />
          <span :class="{ 'avatar-fallback': authStore.userAvatar }">{{ userInitials(authStore.userName) }}</span>
          <span class="online-dot"></span>
        </div>
        <div class="admin-details">
          <strong class="admin-name">{{ authStore.userName }}</strong>
          <span class="admin-email">{{ authStore.userEmail }}</span>
          <span class="admin-role-pill">SYSTEM ADMIN</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="nav-section-title">MANAGEMENT MODULES</div>
      <nav class="sidebar-nav">
        <button class="nav-item" :class="{ active: activeTab === 'products' }" @click="selectTab('products')">
          <div class="nav-item-left">
            <i class="fa fa-motorcycle nav-icon"></i>
            <span class="nav-label">Products</span>
          </div>
          <span class="nav-count cyan-count">{{ products.length }}</span>
        </button>

        <button class="nav-item" :class="{ active: activeTab === 'orders' }" @click="selectTab('orders')">
          <div class="nav-item-left">
            <i class="bi bi-cart3 nav-icon"></i>
            <span class="nav-label">Orders</span>
          </div>
          <span class="nav-count amber-count">{{ orders.length }}</span>
        </button>

        <button class="nav-item" :class="{ active: activeTab === 'users' }" @click="selectTab('users')">
          <div class="nav-item-left">
            <i class="bi bi-people nav-icon"></i>
            <span class="nav-label">Users</span>
          </div>
          <span class="nav-count emerald-count">{{ users.length }}</span>
        </button>
      </nav>

      <!-- Sidebar Footer Actions -->
      <div class="sidebar-footer">
        <router-link to="/profile" class="footer-action-btn">
          <i class="bi bi-person-circle f-icon"></i>
          <span>Admin Profile</span>
        </router-link>

        <button class="footer-action-btn sync-btn" @click="refreshAllModules" :disabled="isRefreshing">
          <i class="bi bi-arrow-clockwise f-icon" :class="{ 'spin-anim': isRefreshing }"></i>
          <span>{{ isRefreshing ? 'Syncing...' : 'Sync All Data' }}</span>
        </button>

        <button class="footer-action-btn logout-btn" @click="handleLogout">
          <i class="bi bi-box-arrow-right f-icon"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- ── 2. MAIN CONTENT WRAPPER ──────────────────────────────── -->
    <main class="admin-main">
      <!-- Main Top Bar Header -->
      <header class="main-topbar">
        <div class="topbar-left">
          <button class="mobile-toggle-btn" @click="isMobileMenuOpen = true" title="Open Sidebar">
            <i class="bi bi-list"></i>
          </button>
          <div class="breadcrumb-area">
            <span class="breadcrumb-root">Admin Portal</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-active">{{ tabTitles[activeTab] || 'Dashboard' }}</span>
          </div>
        </div>

        <div class="topbar-right">
          <router-link to="/profile" class="topbar-profile-card" title="View Admin Profile">
            <div class="topbar-avatar">
              <img v-if="authStore.userAvatar" :src="orderAvatarUrl(authStore.userAvatar)"
                :alt="`${authStore.userName} avatar`" @error="$event.target.style.display = 'none'" />
              <span :class="{ 'avatar-fallback': authStore.userAvatar }">{{ userInitials(authStore.userName) }}</span>
              <span class="topbar-online-dot"></span>
            </div>
            <div class="topbar-user-meta">
              <span class="topbar-user-name">{{ authStore.userName }}</span>
              <span class="topbar-user-email">{{ authStore.userEmail }}</span>
            </div>
            <span class="topbar-role-badge">ADMIN</span>
          </router-link>

          <button class="topbar-logout-btn" @click="handleLogout" title="Sign Out">
            <i class="bi bi-box-arrow-right t-logout-icon"></i>
          </button>
        </div>
      </header>

      <!-- Scrollable Tab Content View -->
      <div class="main-body-content">
        <!-- ── TAB 1: PRODUCT MODULE ──────────────────── -->
        <div v-if="activeTab === 'products'" class="tab-pane-view">
          <div class="section-heading">
            <div>
              <h2 class="section-title"><i class="fa fa-motorcycle"></i> Superbike Inventory</h2>
              <p class="section-subtitle">Manage bikes, stock counts, descriptions, and uploaded images.</p>
            </div>
            <button class="topbar-btn primary" @click="openCreateProductModal">
              <i class="fa fa-plus"></i>
              <span>Add New Product</span>
            </button>
          </div>

          <div class="module-panel">
            <!-- Control Bar -->
            <div class="module-control-bar">
              <div class="search-box">
                <i class="fa fa-search search-icon"></i>
                <input v-model="productSearchQuery" type="text"
                  placeholder="Search products by model, brand, or description..." />
                <button v-if="productSearchQuery" class="clear-search-btn" @click="productSearchQuery = ''">
                  <i class="fa fa-times"></i>
                </button>
              </div>

              <div class="filter-group">
                <span class="module-counter">{{ filteredProducts.length }} items shown</span>
              </div>
            </div>

            <!-- Products Data Table -->
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product / Model</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Stock Quantity</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bike in filteredProducts" :key="bike.id || bike._id">
                    <td>
                      <div class="product-cell">
                        <ProductImage :src="bike" :alt="bike.name" img-class="bike-thumb" />
                        <div class="product-info">
                          <strong class="bike-name">{{ bike.name }}</strong>
                          <span class="bike-id font-mono">ID: #{{ bike.id || bike._id }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="text-muted">{{ bike.description || 'Bigbike Store Exclusive' }}</td>
                    <td class="font-bold price-tag">${{ (bike.price || 0).toLocaleString() }}</td>
                    <td>
                      <div class="stock-cell">
                        <span class="font-mono stock-number">{{ bike.stock ?? 0 }} Units</span>
                        <button class="stock-edit-btn" @click="openStockModal(bike)"
                          title="Update Stock (PATCH /products/:id/stock)">
                          <i class="fa fa-cubes"></i> Stock
                        </button>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill" :class="{
                        'status-in-stock': (bike.stock ?? 0) > 2,
                        'status-low-stock': (bike.stock ?? 0) > 0 && (bike.stock ?? 0) <= 2,
                        'status-out-of-stock': (bike.stock ?? 0) === 0
                      }">
                        {{ (bike.stock ?? 0) > 0 ? `In Stock (${bike.stock})` : 'Out of Stock' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="action-buttons">
                        <button class="tbl-btn edit" @click="openEditProductModal(bike)" title="PATCH /products/:id">
                          <i class="fa fa-pencil"></i> Edit
                        </button>
                        <button class="tbl-btn delete" @click="deleteProduct(bike.id || bike._id)"
                          title="DELETE /products/:id">
                          <i class="fa fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredProducts.length === 0">
                    <td colspan="6" class="empty-row">
                      <div class="empty-table-state">
                        <i class="fa fa-motorcycle empty-emoji"></i>
                        <p>No products found matching your search.</p>
                        <button class="tbl-btn edit" @click="openCreateProductModal">
                          <i class="fa fa-plus"></i> Add Product
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ── TAB 3: ORDER MODULE ────────────────────── -->
        <div v-if="activeTab === 'orders'" class="tab-pane-view">
          <div class="section-heading">
            <div>
              <h2 class="section-title"><i class="fa fa-shopping-cart"></i> Customer Orders</h2>
              <p class="section-subtitle">Audit reservations, inspect buyers, and monitor transactions.</p>
            </div>
            <button class="refresh-pill-btn" @click="fetchOrders" :disabled="isRefreshing">
              <i class="fa fa-refresh"></i>
              <span>Refresh Orders</span>
            </button>
          </div>

          <div class="module-panel">
            <!-- Order Control Bar -->
            <div class="module-control-bar">
              <div class="search-box">
                <i class="fa fa-search search-icon"></i>
                <input v-model="orderSearchQuery" type="text"
                  placeholder="Search orders by Order ID, customer name, or email..." />
              </div>

            </div>

            <!-- Orders Data Table -->
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ord in filteredOrders" :key="ord.id">
                    <td>
                      <span class="order-id-tag">#{{ ord.id }}</span>
                    </td>
                    <td>
                      <div class="customer-cell">
                        <span class="user-avatar-mini user-avatar-image">
                          <img v-if="ord.user?.avatar" :src="orderAvatarUrl(ord.user.avatar)"
                            :alt="`${ord.user.name || 'Customer'} avatar`"
                            @error="$event.target.style.display = 'none'" />
                          <span :class="{ 'avatar-fallback': ord.user?.avatar }">{{ orderInitials(ord.user?.name)
                            }}</span>
                        </span>
                        <div class="customer-info">
                          <strong>{{ ord.user?.name || 'Guest Customer' }}</strong>
                          <small>{{ ord.user?.email || '—' }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="price-tag">${{ Number(ord.total || 0).toLocaleString() }}</span>
                    </td>
                    <td>
                      <span class="font-mono">{{ ord.items?.length ?? '—' }} item(s)</span>
                    </td>
                    <td class="text-muted">
                      <span class="order-date-cell">
                        <i class="fa fa-calendar"></i>
                        {{ formatOrderDate(ord.createdAt) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button class="tbl-btn view" @click="viewOrderDetails(ord)">
                        <i class="fa fa-eye"></i> Details
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredOrders.length === 0">
                    <td colspan="6" class="empty-row">
                      <div class="empty-table-state">
                        <i class="fa fa-shopping-cart empty-emoji"></i>
                        <p>No orders match your search.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ── TAB 4: USER MODULE ─────────────────────── -->
        <BaseModal :show="showOrderProductModal" title="Ordered Product"
          :subtitle="selectedOrder ? 'Order #' + selectedOrder.id : ''" size="md" @close="closeOrderProductModal">
          <div v-if="isLoadingOrderProduct" class="order-product-state">
            <i class="fa fa-spinner spin-anim"></i> Loading product details...
          </div>

          <div v-else-if="orderProductError" class="order-product-state is-error">
            <i class="fa fa-exclamation-triangle"></i>
            <span>{{ orderProductError }}</span>
          </div>

          <div v-else-if="selectedProduct" class="order-product-detail">
            <img v-if="selectedProduct.image" class="order-product-image" :src="productImageUrl(selectedProduct.image)"
              :alt="selectedProduct.name" />
            <div class="order-product-content">
              <span class="product-detail-id">Product #{{ selectedProduct.id }}</span>
              <h3>{{ selectedProduct.name }}</h3>
              <p v-if="selectedProduct.description">{{ selectedProduct.description }}</p>
              <dl class="product-detail-meta">
                <div>
                  <dt>Price</dt>
                  <dd>$ {{ Number(selectedProduct.price || 0).toLocaleString() }}</dd>
                </div>
                <div>
                  <dt>Stock</dt>
                  <dd>{{ selectedProduct.stock ?? '—' }}</dd>
                </div>
                <div v-if="selectedProduct.createdAt">
                  <dt>Added</dt>
                  <dd>{{ formatOrderDate(selectedProduct.createdAt) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </BaseModal>

        <div v-if="activeTab === 'users'" class="tab-pane-view">
          <div class="section-heading">
            <div>
              <h2 class="section-title"><i class="fa fa-users"></i> User & Rider Directory</h2>
              <p class="section-subtitle">Review registered accounts, roles, and administrative privileges.</p>
            </div>
            <button class="refresh-pill-btn" @click="fetchUsers(1)" :disabled="isRefreshing">
              <i class="fa fa-refresh"></i>
              <span>Refresh Users</span>
            </button>
          </div>

          <div class="module-panel">
            <!-- User Control Bar -->
            <div class="module-control-bar">
              <div class="search-box">
                <i class="fa fa-search search-icon"></i>
                <input v-model="userSearchQuery" type="text" placeholder="Search riders by name or email address..." />
              </div>

              <div class="filter-group">
                <select v-model="userRoleFilter" class="filter-select">
                  <option value="all">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="user">Riders / Users</option>
                </select>
              </div>
            </div>

            <!-- Users Data Table -->
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Rider / User</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Age</th>
                    <th>Joined Date</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="usr in filteredUsers" :key="usr.id">
                    <td>
                      <div class="customer-cell">
                        <span class="user-avatar-mini user-avatar-image"
                          :class="{ 'admin-avatar': usr.role === 'admin' }">
                          <img v-if="usr.avatar" :src="orderAvatarUrl(usr.avatar)" :alt="`${usr.name || 'User'} avatar`"
                            @error="$event.target.style.display = 'none'" />
                          <span :class="{ 'avatar-fallback': usr.avatar }">{{ userInitials(usr.name) }}</span>
                        </span>
                        <strong>{{ usr.name || '—' }}</strong>
                      </div>
                    </td>
                    <td class="font-mono text-muted">{{ usr.email }}</td>
                    <td>
                      <span :class="['role-pill', usr.role === 'admin' ? 'admin-pill' : 'user-pill']">
                        {{ (usr.role || 'user').toUpperCase() }}
                      </span>
                    </td>
                    <td>{{ usr.age != null ? usr.age + ' Yrs' : '—' }}</td>
                    <td class="text-muted">{{ usr.createdAt ? new Date(usr.createdAt).toLocaleDateString() : '—' }}</td>
                    <td class="text-right">
                      <button class="tbl-btn edit" @click="manageUser(usr)">
                        <i class="fa fa-cog"></i> Manage
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredUsers.length === 0">
                    <td colspan="6" class="empty-row">
                      <div class="empty-table-state">
                        <i class="fa fa-users empty-emoji"></i>
                        <p>No users found matching query.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Load More Users -->
            <div v-if="userHasMore" class="load-more-row">
              <button class="tbl-btn view" @click="fetchUsers(userPage + 1)">
                <i class="fa fa-chevron-down"></i> Load More Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ── 3. MODALS ────────────────────────────────────────────── -->
    <!-- Product Create & Edit Modal (POST /products & PATCH /products/:id) -->
    <BaseModal v-model="showProductModal"
      :title="editingProduct ? `Edit Product #${editingProduct.id || editingProduct._id}` : 'Create New Product'"
      :subtitle="editingProduct ? 'PATCH /products/:productId' : 'POST /products'" size="lg">
      <form @submit.prevent="saveProduct" class="modal-form">
        <div class="form-row">
          <div class="form-field">
            <label>Product Name (name)</label>
            <input v-model="productForm.name" type="text" placeholder="e.g. Yamaha R1M" required />
          </div>
          <div class="form-field">
            <label>Price ($ USD)</label>
            <input v-model.number="productForm.price" type="number" placeholder="10000" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Description</label>
            <input v-model="productForm.description" type="text" placeholder="e.g. 1000cc Crossplane Superbike"
              required />
          </div>
          <div class="form-field">
            <label>Stock Count</label>
            <input v-model.number="productForm.stock" type="number" placeholder="10" required />
          </div>
        </div>

        <!-- Product Image File Upload with Live Preview -->
        <div class="form-field full-width">
          <label>Product Image (POST /products/:productId/image)</label>
          <input type="file" accept="image/*" @change="onProductFileSelected" class="file-picker" />
          <div v-if="productPreviewUrl" class="product-preview-box">
            <img :src="productPreviewUrl" alt="Product image preview" class="product-img-preview" />
            <span class="preview-filename">{{ selectedProductFile?.name }}</span>
          </div>
        </div>

        <div class="modal-form-actions">
          <button type="button" class="modal-btn cancel" @click="showProductModal = false"
            :disabled="isSavingProduct">Cancel</button>
          <button type="submit" class="modal-btn confirm" :disabled="isSavingProduct">
            <span v-if="isSavingProduct" class="btn-spinner"></span>
            <span>{{ isSavingProduct ? 'Saving...' : (editingProduct ? 'Save Changes (PATCH)' : 'Create Product (POST)')
              }}</span>
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Quick Stock Modal (PATCH /products/:productId/stock) -->
    <BaseModal v-model="showStockModal" :title="`Update Stock: ${stockEditingBike?.name}`"
      subtitle="PATCH /products/:productId/stock" size="sm">
      <form @submit.prevent="saveStockOnly" class="modal-form">
        <div class="form-field">
          <label>New Stock Quantity</label>
          <input v-model.number="quickStockValue" type="number" min="0" placeholder="e.g. 15" required />
        </div>

        <div class="modal-form-actions">
          <button type="button" class="modal-btn cancel" @click="showStockModal = false"
            :disabled="isSavingStock">Cancel</button>
          <button type="submit" class="modal-btn confirm" :disabled="isSavingStock">
            <span v-if="isSavingStock" class="btn-spinner"></span>
            <span>Update Stock</span>
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import productService from '@/services/productService';
import orderService from '@/services/orderService';
import userService from '@/services/userService';
import BaseModal from '@/components/BaseModal.vue';
import ProductImage from '@/components/ProductImage.vue';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const activeTab = ref('products');
const isRefreshing = ref(false);
const isSavingProduct = ref(false);
const isSavingStock = ref(false);
const isMobileMenuOpen = ref(false);

const tabTitles = {
  products: 'Superbike Inventory Management',
  orders: 'Customer Order Audit',
  users: 'Rider & User Directory',
};

const selectTab = (tab) => {
  activeTab.value = tab;
  isMobileMenuOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  toast.info('You have been signed out', 'Session Ended');
  router.push('/login');
};

// ── Product Module State ──────────────────────────────
const productSearchQuery = ref('');
const showProductModal = ref(false);
const showStockModal = ref(false);
const editingProduct = ref(null);
const stockEditingBike = ref(null);
const quickStockValue = ref(10);
const selectedProductFile = ref(null);
const productPreviewUrl = ref(null);

const productForm = reactive({
  name: 'Yamaha R1M',
  price: 10000,
  description: 'Big Bike',
  stock: 10,
});

// Products Data List
const products = ref([]);

// Fetch Products from GET /products/my
const fetchProducts = async () => {
  try {
    const res = await productService.getMyProducts();
    const list = res?.data || res;
    if (Array.isArray(list)) {
      products.value = list;
    } else if (list && Array.isArray(list.data)) {
      products.value = list.data;
    } else {
      products.value = [];
    }
  } catch (err) {
    products.value = [];
  }
};

const onProductFileSelected = (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  selectedProductFile.value = file;
  productPreviewUrl.value = URL.createObjectURL(file);
};

const openCreateProductModal = () => {
  editingProduct.value = null;
  productForm.name = 'Yamaha R1M';
  productForm.price = 10000;
  productForm.description = 'Big Bike';
  productForm.stock = 10;
  selectedProductFile.value = null;
  productPreviewUrl.value = null;
  showProductModal.value = true;
};

const openEditProductModal = (bike) => {
  editingProduct.value = bike;
  productForm.name = bike.name;
  productForm.price = bike.price;
  productForm.description = bike.description || 'Big Bike';
  productForm.stock = bike.stock ?? 10;
  selectedProductFile.value = null;
  productPreviewUrl.value = null;
  showProductModal.value = true;
};

const openStockModal = (bike) => {
  stockEditingBike.value = bike;
  quickStockValue.value = bike.stock ?? 10;
  showStockModal.value = true;
};

// Create or Update Product
const saveProduct = async () => {
  isSavingProduct.value = true;
  try {
    const payload = {
      name: productForm.name,
      price: Number(productForm.price),
      description: productForm.description,
      stock: Number(productForm.stock),
    };

    let savedBike = null;

    if (editingProduct.value) {
      const bikeId = editingProduct.value.id || editingProduct.value._id;
      const res = await productService.updateProduct(bikeId, payload);
      savedBike = res?.data || res;
      toast.success(`Product #${bikeId} updated (PATCH /products/:id)`, 'Product Updated');
    } else {
      const res = await productService.createProduct(payload);
      savedBike = res?.data || res;
      toast.success('New product created (POST /products)', 'Product Created');
    }

    // Handle Image Upload if selected
    if (selectedProductFile.value && savedBike) {
      const targetId = savedBike.id || savedBike._id || editingProduct.value?.id || editingProduct.value?._id;
      if (targetId) {
        try {
          await productService.uploadProductImage(targetId, selectedProductFile.value);
          toast.success('Product image uploaded successfully.', 'Image Uploaded');
        } catch (imgErr) {
          toast.warning('Product saved, but image upload failed.', 'Image Notice');
        }
      }
    }

    showProductModal.value = false;
    await fetchProducts();
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to save product';
    toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg, 'Save Error');
  } finally {
    isSavingProduct.value = false;
  }
};

// Quick Stock Update
const saveStockOnly = async () => {
  if (!stockEditingBike.value) return;
  isSavingStock.value = true;
  try {
    const bikeId = stockEditingBike.value.id || stockEditingBike.value._id;
    await productService.updateStock(bikeId, quickStockValue.value);
    toast.success(`Stock updated for ${stockEditingBike.value.name} (PATCH /products/:id/stock)`, 'Stock Updated');
    showStockModal.value = false;
    await fetchProducts();
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to update stock';
    toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg, 'Stock Error');
  } finally {
    isSavingStock.value = false;
  }
};

// Delete Product
const deleteProduct = async (id) => {
  if (!confirm(`Are you sure you want to delete Product #${id}? This action cannot be undone.`)) {
    return;
  }

  try {
    await productService.deleteProduct(id);
    toast.success(`Product #${id} removed (DELETE /products/:id)`, 'Product Deleted');
    await fetchProducts();
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to delete product';
    toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg, 'Delete Error');
  }
};

// ── Order Module State & Filters ──────────────────────
const orderSearchQuery = ref('');
const orders = ref([]);

// Fetch Orders from GET /orders
const fetchOrders = async () => {
  try {
    const res = await orderService.getAllOrders();
    const payload = res?.data || res;
    if (Array.isArray(payload)) {
      orders.value = payload;
    } else if (payload && Array.isArray(payload.data)) {
      orders.value = payload.data;
    } else if (payload && Array.isArray(payload.items)) {
      orders.value = payload.items;
    } else {
      orders.value = [];
    }
  } catch (err) {
    orders.value = [];
  }
};

// ── User Module State & Filters ───────────────────────
const userSearchQuery = ref('');
const userRoleFilter = ref('all');
const users = ref([]);
const userPage = ref(1);
const userLimit = ref(10);
const userHasMore = ref(true);

// Fetch Users from GET /users?page=1&limit=10
const fetchUsers = async (page = 1) => {
  try {
    const res = await userService.getAllUsers(page, userLimit.value);
    const payload = res?.data || res;
    const list = Array.isArray(payload) ? payload : (payload?.data ?? payload?.items ?? []);
    if (page === 1) {
      users.value = list;
    } else {
      users.value = [...users.value, ...list];
    }
    userHasMore.value = list.length >= userLimit.value;
    userPage.value = page;
  } catch (err) {
    if (page === 1) users.value = [];
  }
};

// Filtered Lists
const filteredProducts = computed(() => {
  return products.value.filter((bike) => {
    const q = productSearchQuery.value.toLowerCase();
    const nameMatch = (bike.name || '').toLowerCase().includes(q);
    const descMatch = (bike.description || '').toLowerCase().includes(q);
    return nameMatch || descMatch;
  });
});

const filteredOrders = computed(() => {
  const q = orderSearchQuery.value.toLowerCase();
  return orders.value.filter((ord) => {
    const orderId = String(ord.id || '');
    const customerName = (ord.user?.name || ord.customerName || '').toLowerCase();
    const customerEmail = (ord.user?.email || ord.customerEmail || '').toLowerCase();
    const matchesSearch = orderId.includes(q) || customerName.includes(q) || customerEmail.includes(q);
    return matchesSearch;
  });
});

const orderInitials = (name) => {
  if (!name) return 'GC';
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const userInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const orderAvatarUrl = (avatarPath) => {
  if (!avatarPath || avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) return avatarPath;
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${apiBase}/${avatarPath.replace(/^\//, '')}`;
};

const formatOrderDate = (createdAt) => {
  if (!createdAt) return 'Date unavailable';
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const filteredUsers = computed(() => {
  const q = userSearchQuery.value.toLowerCase();
  return users.value.filter((usr) => {
    const matchesSearch =
      (usr.name || '').toLowerCase().includes(q) ||
      (usr.email || '').toLowerCase().includes(q);
    const matchesRole = userRoleFilter.value === 'all' || usr.role === userRoleFilter.value;
    return matchesSearch && matchesRole;
  });
});

const showOrderProductModal = ref(false);
const isLoadingOrderProduct = ref(false);
const selectedOrder = ref(null);
const selectedProduct = ref(null);
const orderProductError = ref('');

const unwrapResponseData = (response) => {
  const payload = response?.data ?? response;
  return payload?.data ?? payload;
};

const productImageUrl = (imagePath) => {
  if (!imagePath || imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${apiBase}/${imagePath.replace(/^\//, '')}`;
};

const closeOrderProductModal = () => {
  showOrderProductModal.value = false;
  selectedOrder.value = null;
  selectedProduct.value = null;
  orderProductError.value = '';
};

const viewOrderDetails = (ord) => {
  selectedOrder.value = ord;
  selectedProduct.value = null;
  orderProductError.value = '';
  isLoadingOrderProduct.value = true;
  showOrderProductModal.value = true;

  return (async () => {
    try {
      // The list does not include productId, so retrieve the order first.
      const orderDetail = unwrapResponseData(await orderService.getOrderById(ord.id));
      const productId = orderDetail?.items?.[0]?.productId
        ?? orderDetail?.items?.[0]?.product?.id
        ?? orderDetail?.productId
        ?? ord.items?.[0]?.productId
        ?? ord.productId;

      if (!productId) {
        orderProductError.value = 'This order has no product reference to display.';
        return;
      }

      selectedProduct.value = unwrapResponseData(await productService.getProductById(productId));
    } catch (err) {
      orderProductError.value = err?.response?.data?.message || err?.message || 'Unable to load product details.';
    } finally {
      isLoadingOrderProduct.value = false;
    }
  })();

  const orderId = ord.id;
  const customer = ord.user?.name || ord.customerName || 'Unknown';
  toast.info(`Order #${orderId} — ${customer} — $${(ord.total || 0).toLocaleString()}`, 'Order Details');
};

const manageUser = (usr) => {
  toast.info(`Managing rider account: ${usr.name || usr.email}`, 'User Module');
};

const refreshAllModules = async () => {
  isRefreshing.value = true;
  try {
    await Promise.all([fetchProducts(), fetchOrders(), fetchUsers(1)]);
    toast.success('All telemetry and data synchronized.', 'Data Refreshed');
  } finally {
    isRefreshing.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchOrders(), fetchUsers(1)]);
});
</script>

<style scoped>
/* ── PORTAL LAYOUT ────────────────────────────────────────── */
.admin-portal {
  display: flex;
  min-height: 100vh;
  background: #070a13;
  color: #f8fafc;
  font-family: inherit;
  position: relative;
}

/* ── 1. SIDEBAR STYLES (FIXED FULL HEIGHT) ────────────────── */
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 270px;
  min-width: 270px;
  height: 100vh;
  background: rgba(11, 15, 25, 0.98);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.15rem;
  z-index: 100;
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 1.25rem;
}

.brand-logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-emoji {
  font-size: 1.6rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f8fafc;
}

.brand-highlight {
  color: #38bdf8;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  background: rgba(56, 189, 248, 0.15);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.2rem;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.brand-sub {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.mobile-close-btn {
  display: none;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
}

/* Admin Profile Card in Sidebar */
.admin-profile-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  margin-bottom: 1.5rem;
}

.admin-avatar {
  position: relative;
  overflow: hidden;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #0284c7;
  color: #ffffff;
  font-weight: 800;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
}

.admin-avatar img,
.topbar-avatar img {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.online-dot {
  position: absolute;
  z-index: 2;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #070a13;
}

.admin-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #f8fafc;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.admin-email {
  font-size: 0.72rem;
  color: #94a3b8;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.admin-role-pill {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fbbf24;
  margin-top: 0.2rem;
}

/* Nav Menu in Sidebar */
.nav-section-title {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #475569;
  margin-bottom: 0.65rem;
  padding-left: 0.5rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 0.9rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #94a3b8;
  font-size: 0.88rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.nav-item-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.nav-icon {
  font-size: 1.15rem;
}

.nav-label {
  letter-spacing: -0.01em;
}

.nav-item:hover {
  background: rgba(30, 41, 59, 0.5);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.05);
  transform: translateX(2px);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(2, 132, 199, 0.25) 100%);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.15);
  font-weight: 700;
}

.nav-count {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}

.cyan-count {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.amber-count {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.emerald-count {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

/* Sidebar Footer */
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-action-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(71, 85, 105, 0.3);
  border-radius: 10px;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-action-btn:hover {
  background: rgba(51, 65, 85, 0.6);
  color: #f8fafc;
  border-color: rgba(148, 163, 184, 0.4);
}

.f-icon {
  width: 1rem;
  height: 1rem;
}

.sync-btn:hover {
  color: #38bdf8;
  border-color: #38bdf8;
}

.logout-btn {
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.25);
  color: #fb7185;
}

.logout-btn:hover {
  background: rgba(244, 63, 94, 0.2);
  color: #ffffff;
  border-color: #fb7185;
}

/* ── 2. MAIN CONTENT STYLES ──────────────────────────────── */
.admin-main {
  margin-left: 270px;
  width: calc(100% - 270px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #070a13;
}

/* Main Top Bar Header */
.main-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 2rem;
  background: rgba(11, 15, 25, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: 0;
  z-index: 40;
  gap: 1rem;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-toggle-btn {
  display: none;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #f8fafc;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.mobile-toggle-btn svg {
  width: 20px;
  height: 20px;
}

.breadcrumb-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
}

.breadcrumb-root {
  color: #64748b;
  font-weight: 600;
}

.breadcrumb-sep {
  color: #475569;
}

.breadcrumb-active {
  color: #f8fafc;
  font-weight: 700;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.topbar-profile-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.85rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
}

.topbar-profile-card:hover {
  background: rgba(30, 41, 59, 0.85);
  border-color: rgba(56, 189, 248, 0.4);
}

.topbar-avatar {
  position: relative;
  overflow: hidden;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
  color: #fff;
  font-weight: 800;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-online-dot {
  position: absolute;
  z-index: 2;
  bottom: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  border: 1.5px solid #070a13;
}

.topbar-user-meta {
  display: flex;
  flex-direction: column;
}

.topbar-user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.2;
}

.topbar-user-email {
  font-size: 0.7rem;
  color: #94a3b8;
  line-height: 1.2;
}

.topbar-role-badge {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.topbar-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fb7185;
  cursor: pointer;
  transition: all 0.2s;
}

.topbar-logout-btn:hover {
  background: rgba(244, 63, 94, 0.25);
  color: #ffffff;
  border-color: #fb7185;
}

.t-logout-icon {
  width: 1.15rem;
  height: 1.15rem;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

/* Main Body Content */
.main-body-content {
  padding: 2rem 2.25rem 4rem 2.25rem;
  flex: 1;
}

.tab-pane-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Section Headings */
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
  margin: 0.25rem 0 0;
}

.refresh-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 10px;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-pill-btn:hover:not(:disabled) {
  border-color: #38bdf8;
  color: #38bdf8;
}

/* ── 3. MODULE PANELS & DATA TABLES ──────────────────────── */
.module-panel {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}

.module-control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.15rem 1.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.4);
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  min-width: 300px;
}

.search-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: #64748b;
}

.search-box input {
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 0.88rem;
  outline: none;
  width: 100%;
  font-family: inherit;
}

.search-box input::placeholder {
  color: #64748b;
}

.clear-search-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 0.85rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-select {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #f8fafc;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  font-size: 0.85rem;
  outline: none;
  font-family: inherit;
  cursor: pointer;
}

.module-counter {
  font-size: 0.82rem;
  color: #64748b;
}

/* Order table helpers */
.order-id-tag {
  font-family: monospace;
  font-size: 0.88rem;
  font-weight: 800;
  color: #38bdf8;
}

.order-date-cell {
  font-size: 0.82rem;
  color: #94a3b8;
}

.order-date-cell i {
  color: #38bdf8;
  margin-right: 0.3rem;
}

.avatar-fallback {
  display: none;
}

.user-avatar-image img[style*='display: none']+.avatar-fallback {
  display: block;
}

.order-product-state {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  color: #94a3b8;
  text-align: center;
}

.order-product-state.is-error {
  color: #fb7185;
}

.order-product-detail {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}

.order-product-image {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  background: #1e293b;
}

.order-product-content h3 {
  margin: 0.25rem 0 0.45rem;
  color: #f8fafc;
}

.order-product-content>p {
  margin: 0 0 0.85rem;
  color: #94a3b8;
  font-size: 0.88rem;
  line-height: 1.55;
}

.product-detail-id {
  color: #38bdf8;
  font-family: monospace;
  font-size: 0.78rem;
  font-weight: 700;
}

.product-detail-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin: 0;
}

.product-detail-meta div {
  padding: 0.55rem 0.65rem;
  background: rgba(30, 41, 59, 0.55);
  border-radius: 8px;
}

.product-detail-meta dt {
  color: #64748b;
  font-size: 0.69rem;
  text-transform: uppercase;
}

.product-detail-meta dd {
  margin: 0.2rem 0 0;
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 700;
}

/* Data Table */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 0.9rem 1.4rem;
  background: rgba(30, 41, 59, 0.35);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.data-table td {
  padding: 1rem 1.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.88rem;
  vertical-align: middle;
}

.data-table tr:hover td {
  background: rgba(30, 41, 59, 0.3);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

:deep(.bike-thumb) {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 10px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.product-info {
  display: flex;
  flex-direction: column;
}

.bike-name {
  color: #f8fafc;
  font-size: 0.92rem;
}

.bike-id {
  font-size: 0.72rem;
  color: #38bdf8;
}

.price-tag {
  color: #a3e635;
  font-size: 0.95rem;
}

.stock-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-number {
  color: #f8fafc;
}

.stock-edit-btn {
  padding: 0.2rem 0.45rem;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.stock-edit-btn:hover {
  background: rgba(56, 189, 248, 0.25);
}

.status-pill {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 700;
}

.status-in-stock {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.status-low-stock {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.status-out-of-stock {
  background: rgba(244, 63, 94, 0.15);
  color: #fb7185;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.45rem;
}

.tbl-btn {
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  font-family: inherit;
}

.tbl-btn.edit {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
}

.tbl-btn.edit:hover {
  background: rgba(56, 189, 248, 0.25);
}

.tbl-btn.delete {
  background: rgba(244, 63, 94, 0.12);
  color: #fb7185;
  border-color: rgba(244, 63, 94, 0.3);
}

.tbl-btn.delete:hover {
  background: rgba(244, 63, 94, 0.25);
  color: #fff;
}

.tbl-btn.view {
  background: rgba(99, 102, 241, 0.12);
  color: #a5b4fc;
  border-color: rgba(99, 102, 241, 0.3);
}

.tbl-btn.view:hover {
  background: rgba(99, 102, 241, 0.25);
}

.empty-row {
  text-align: center;
  padding: 3rem 1.5rem !important;
}

.empty-table-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  color: #64748b;
}

.empty-emoji {
  font-size: 2.2rem;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-mini {
  position: relative;
  overflow: hidden;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #1e293b;
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.75rem;
}

.user-avatar-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

.user-avatar-mini.admin-avatar {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-info small {
  color: #64748b;
  font-size: 0.74rem;
}

.highlight-id {
  color: #38bdf8;
  font-weight: 700;
}

.role-pill {
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 800;
}

.admin-pill {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.user-pill {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.load-more-row {
  display: flex;
  justify-content: center;
  padding: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ── MODALS & FORMS ──────────────────────────────────────── */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
}

.form-field input[type="text"],
.form-field input[type="number"] {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  color: #f8fafc;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-field input:focus {
  border-color: #38bdf8;
}

.file-picker {
  padding: 0.5rem 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

.product-preview-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 10px;
  border: 1px dashed rgba(56, 189, 248, 0.4);
}

.product-img-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.preview-filename {
  font-size: 0.82rem;
  color: #38bdf8;
  font-family: monospace;
}

.modal-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.modal-btn {
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.modal-btn.cancel {
  background: rgba(30, 41, 59, 0.8);
  color: #94a3b8;
  border: 1px solid rgba(71, 85, 105, 0.4);
}

.modal-btn.cancel:hover {
  color: #f8fafc;
  border-color: #94a3b8;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);
}

.modal-btn.confirm:hover:not(:disabled) {
  box-shadow: 0 6px 18px rgba(14, 165, 233, 0.6);
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spin-anim {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── RESPONSIVE STYLES ────────────────────────────────────── */
@media (max-width: 768px) {
  .admin-main {
    margin-left: 0;
    width: 100%;
  }

  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  }

  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }

  .mobile-close-btn {
    display: block;
  }

  .mobile-toggle-btn {
    display: inline-flex;
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 35;
  }

  .main-topbar {
    padding: 0.9rem 1.25rem;
  }

  .main-body-content {
    padding: 1.25rem 1.25rem 3rem 1.25rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .order-card-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .order-product-detail {
    grid-template-columns: 1fr;
  }

  .order-product-image {
    width: 100%;
    height: 200px;
  }
}
</style>
