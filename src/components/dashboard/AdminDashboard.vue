<template>
  <div class="admin-portal">
    <!-- Mobile Sidebar Backdrop -->
    <div v-if="isMobileMenuOpen" class="sidebar-backdrop" @click="isMobileMenuOpen = false"></div>

    <!-- ── 1. LEFT SIDEBAR ──────────────────────────────────────── -->
    <aside class="admin-sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
      <!-- Brand & Title -->
      <div class="sidebar-brand">
        <div class="brand-logo-wrap">
          <div class="brand-icon-box"><i class="fa fa-motorcycle"></i></div>
          <div class="brand-text">
            <span class="brand-title">BigBike</span>
            <span class="brand-sub">Admin portal</span>
          </div>
        </div>
        <button class="mobile-close-btn" @click="isMobileMenuOpen = false">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Navigation Menu -->
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

        <button class="nav-item" :class="{ active: activeTab === 'categories' }" @click="selectTab('categories')">
          <div class="nav-item-left">
            <i class="bi bi-tags nav-icon"></i>
            <span class="nav-label">Categories</span>
          </div>
          <span class="nav-count purple-count">{{ categories.length }}</span>
        </button>

        <button class="nav-item" :class="{ active: activeTab === 'users' }" @click="selectTab('users')">
          <div class="nav-item-left">
            <i class="bi bi-people nav-icon"></i>
            <span class="nav-label">Users</span>
          </div>
          <span class="nav-count emerald-count">{{ users.length }}</span>
        </button>
      </nav>

      <!-- Sidebar Footer – User Info -->
      <div class="sidebar-footer">
        <div class="sidebar-user-row">
          <div class="sidebar-user-avatar">
            <img v-if="authStore.userAvatar" :src="orderAvatarUrl(authStore.userAvatar)"
              :alt="`${authStore.userName} avatar`" @error="$event.target.style.display = 'none'" />
            <span :class="{ 'avatar-fallback': authStore.userAvatar }">{{ userInitials(authStore.userName) }}</span>
          </div>
          <div class="sidebar-user-details">
            <span class="sidebar-user-name">{{ authStore.userName }}</span>
            <span class="sidebar-user-email">{{ authStore.userEmail }}</span>
          </div>
          <button class="sidebar-logout-icon" @click="handleLogout" title="Sign Out">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
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
              <p class="section-subtitle">Manage bikes, stock, prices, specs and photos in one place (POST /products &amp; POST /products/:id/image).</p>
            </div>
            <div class="heading-btn-group">
              <BaseButton variant="secondary" size="md" icon="fa fa-refresh" :loading="isRefreshing" @click="refreshProducts">
                Refresh
              </BaseButton>
              <BaseButton variant="primary" size="md" icon="fa fa-plus" @click="openCreateProductModal">
                + Create New Product
              </BaseButton>
            </div>
          </div>

          <!-- Stats Cards Row -->
          <div class="stats-row">
            <div class="stat-card">
              <span class="stat-label">Models</span>
              <span class="stat-value">{{ products.length }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Units in stock</span>
              <span class="stat-value">{{ products.reduce((s, b) => s + (b.stock ?? 0), 0) }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Stock value</span>
              <span class="stat-value">${{ products.reduce((s, b) => s + ((b.price || 0) * (b.stock ?? 0)), 0).toLocaleString() }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Needs attention</span>
              <span class="stat-value">{{ products.filter(b => (b.stock ?? 0) <= 2).length }}</span>
            </div>
          </div>

          <div class="module-panel">
            <!-- Combined Filter Bar -->
            <div class="module-control-bar">
              <div class="search-box">
                <i class="fa fa-search search-icon"></i>
                <input v-model="productSearchQuery" type="text"
                  placeholder="Search by model, brand or ID" />
                <button v-if="productSearchQuery" class="clear-search-btn" @click="productSearchQuery = ''">
                  <i class="fa fa-times"></i>
                </button>
              </div>

              <div class="filter-bar-right">
                <div class="filter-select-wrap">
                  <select v-model="productCategoryFilter" class="filter-select">
                    <option value="all">All categories</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                  <i class="bi bi-chevron-down filter-select-chevron"></i>
                </div>

                <div class="stock-filter-pills">
                  <button class="stock-pill" :class="{ active: productStockFilter === 'all' }" @click="productStockFilter = 'all'">All</button>
                  <button class="stock-pill" :class="{ active: productStockFilter === 'in' }" @click="productStockFilter = 'in'">In stock</button>
                  <button class="stock-pill" :class="{ active: productStockFilter === 'low' }" @click="productStockFilter = 'low'">Low</button>
                  <button class="stock-pill out" :class="{ active: productStockFilter === 'out' }" @click="productStockFilter = 'out'">Out</button>
                </div>
                <span class="module-counter">{{ filteredProducts.length }} product{{ filteredProducts.length !== 1 ? 's' : '' }}</span>
              </div>
            </div>

            <!-- Products Data Table -->
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bike in filteredProducts" :key="bike.id || bike._id">
                    <td>
                      <div class="product-cell">
                        <div class="bike-avatar-circle" :style="{ background: !bike.image ? getAvatarColor(bike.name) : '#152238' }" @click="openQuickPhotoModal(bike)" title="Click to upload/change photo">
                          <img
                            v-if="bike.image"
                            :src="productImageUrl(bike.image)"
                            :alt="bike.name"
                            class="bike-avatar-img"
                            @error="$event.target.style.display = 'none'"
                          />
                          <span :class="{ 'avatar-fallback': bike.image }">{{ (bike.name || 'B')[0].toUpperCase() }}</span>
                        </div>
                        <div class="product-info">
                          <strong class="bike-name">{{ bike.name }}</strong>
                          <div class="bike-specs-tags">
                            <span class="spec-meta">{{ bike.year || 2026 }}</span>
                            <span class="spec-sep">·</span>
                            <span class="spec-meta">{{ (bike.engince || bike.engine) ? `${bike.engince || bike.engine}cc` : '999cc' }}</span>
                            <span v-if="bike.color" class="spec-sep">·</span>
                            <span v-if="bike.color" class="spec-meta">{{ bike.color }}</span>
                            <span class="spec-sep">·</span>
                            <span class="spec-meta">ID #{{ bike.id || bike._id }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="category-badge">{{ getCategoryName(bike.category_id) }}</span>
                    </td>
                    <td class="font-bold price-tag">${{ (bike.price || 0).toLocaleString() }}</td>
                    <td>
                      <div class="stock-cell-new">
                        <span class="stock-num">{{ bike.stock ?? 0 }}</span>
                        <div class="stock-bar-wrap">
                          <div class="stock-bar-fill" :class="getStockBarClass(bike.stock)"
                            :style="{ width: getStockPercent(bike.stock) + '%' }"></div>
                        </div>
                        <button class="stock-edit-btn" @click="openStockModal(bike)" title="Update Stock">
                          <i class="fa fa-pencil"></i>
                        </button>
                      </div>
                    </td>
                    <td>
                      <span class="status-pill" :class="{
                        'status-in-stock': (bike.stock ?? 0) > 2,
                        'status-low-stock': (bike.stock ?? 0) > 0 && (bike.stock ?? 0) <= 2,
                        'status-out-of-stock': (bike.stock ?? 0) === 0
                      }">
                        <span class="status-dot"></span>
                        {{ (bike.stock ?? 0) > 2 ? 'In stock' : (bike.stock ?? 0) > 0 ? 'Low stock' : 'Out of stock' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="action-buttons">
                        <BaseButton variant="secondary" size="sm" icon="fa fa-camera" @click="openQuickPhotoModal(bike)" title="Upload Photo (POST /products/:id/image)">
                          Photo
                        </BaseButton>
                        <BaseButton variant="secondary" size="sm" @click="openEditProductModal(bike)" title="Edit product">
                          Edit
                        </BaseButton>
                        <BaseButton variant="secondary" size="sm" icon="fa fa-trash" @click="deleteProduct(bike.id || bike._id)" title="Delete" />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredProducts.length === 0">
                    <td colspan="6" class="empty-row">
                      <div class="empty-table-state">
                        <i class="fa fa-motorcycle empty-emoji"></i>
                        <p>No products found matching your search.</p>
                        <BaseButton variant="primary" size="sm" @click="openCreateProductModal">
                          + Add product
                        </BaseButton>
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
                      <BaseButton variant="secondary" size="sm" icon="fa fa-eye" @click="viewOrderDetails(ord)">
                        Details
                      </BaseButton>
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
                      <div class="action-buttons">
                        <BaseButton variant="secondary" size="sm" icon="fa fa-cog" @click="manageUser(usr)">
                          Manage
                        </BaseButton>
                        <BaseButton
                          variant="danger"
                          size="sm"
                          icon="fa fa-trash"
                          :loading="isDeletingUser === usr.id"
                          :disabled="isDeletingUser === usr.id || (authStore.userId && Number(usr.id) === Number(authStore.userId))"
                          @click="handleDeleteUser(usr.id, usr.name || usr.email)"
                          title="Delete User (DELETE /users/:id)"
                        />
                      </div>
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
              <BaseButton variant="secondary" size="md" icon="fa fa-chevron-down" @click="fetchUsers(userPage + 1)">
                Load More Users
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- ── TAB 4: CATEGORIES MODULE ────────────────── -->
        <div v-if="activeTab === 'categories'" class="tab-pane-view">
          <div class="section-heading">
            <div>
              <h2 class="section-title"><i class="bi bi-tags"></i> Brand &amp; Category Directory</h2>
              <p class="section-subtitle">Manage vehicle brands, classifications, and system category codes (GET /categories &amp; POST /categories).</p>
            </div>
            <div class="heading-btn-group">
              <BaseButton variant="primary" size="md" @click="openCreateCategoryModal">
                + Add category
              </BaseButton>
            </div>
          </div>

          <div class="module-panel">
            <!-- Category Control Bar -->
            <div class="module-control-bar">
              <div class="search-box">
                <i class="fa fa-search search-icon"></i>
                <input v-model="categorySearchQuery" type="text"
                  placeholder="Search categories by brand name or description..." />
                <button v-if="categorySearchQuery" class="clear-search-btn" @click="categorySearchQuery = ''">
                  <i class="fa fa-times"></i>
                </button>
              </div>

              <div class="filter-group">
                <span class="module-counter">{{ filteredCategories.length }} categories listed</span>
              </div>
            </div>

            <!-- Categories Data Table -->
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Category ID</th>
                    <th>Brand / Category Name</th>
                    <th>Description</th>
                    <th>Associated Bikes</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cat in filteredCategories" :key="cat.id">
                    <td>
                      <span class="font-mono text-cyan">#{{ cat.id }}</span>
                    </td>
                    <td>
                      <div class="category-name-cell">
                        <span class="category-icon-circle">
                          <i class="bi bi-tag-fill"></i>
                        </span>
                        <strong class="category-brand-name">{{ cat.name }}</strong>
                      </div>
                    </td>
                    <td class="text-muted">{{ cat.description || 'No description provided' }}</td>
                    <td>
                      <span class="spec-tag engine-tag">
                        {{ products.filter(p => Number(p.category_id) === Number(cat.id)).length }} Models
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="action-buttons">
                        <BaseButton
                          variant="danger"
                          size="sm"
                          icon="fa fa-trash"
                          :loading="isDeletingCategory === cat.id"
                          :disabled="isDeletingCategory === cat.id"
                          @click="handleDeleteCategory(cat.id, cat.name)"
                          title="Delete Category"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredCategories.length === 0">
                    <td colspan="5" class="empty-row">
                      <div class="empty-table-state">
                        <i class="bi bi-tags empty-emoji"></i>
                        <p>No categories found matching query.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ── 3. MODALS ────────────────────────────────────────────── -->
    <!-- Product Create & Edit Modal (POST /products & PATCH /products/:id) -->
    <BaseModal v-model="showProductModal"
      :title="editingProduct ? `Edit Product #${editingProduct.id || editingProduct._id}` : 'Create New Superbike'"
      :subtitle="editingProduct ? 'PATCH /products/:productId' : 'POST /products (Data) & POST /products/:id/image (Photo)'" size="lg">
      <form @submit.prevent="saveProduct" class="modal-form">
        <!-- 2-Step Automated Publishing Concept Stepper -->
        <div class="product-concept-stepper">
          <div class="stepper-step active">
            <span class="stepper-num">1</span>
            <div class="stepper-meta">
              <strong class="stepper-title">Product Specifications</strong>
              <small class="stepper-code">POST /products</small>
            </div>
          </div>
          <div class="stepper-arrow"><i class="fa fa-arrow-right"></i></div>
          <div class="stepper-step" :class="{ active: selectedProductFile || editingProduct?.image }">
            <span class="stepper-num">2</span>
            <div class="stepper-meta">
              <strong class="stepper-title">Upload Image Asset</strong>
              <small class="stepper-code">POST /products/:id/image (form-data)</small>
            </div>
          </div>
        </div>

        <!-- Quick Demo Template Buttons (When Creating) -->
        <div v-if="!editingProduct" class="preset-templates-bar">
          <span class="preset-templates-label"><i class="fa fa-bolt"></i> Sample Presets:</span>
          <div class="preset-template-buttons">
            <button
              v-for="tpl in sampleBikeTemplates"
              :key="tpl.name"
              type="button"
              class="tpl-pill-btn"
              :class="{ active: productForm.name === tpl.name }"
              @click="applyBikeTemplate(tpl)"
            >
              {{ tpl.name }}
            </button>
          </div>
        </div>

        <!-- Row 1: Name and Category -->
        <div class="form-row">
          <div class="form-field">
            <label>Product / Machine Name (name)</label>
            <input v-model="productForm.name" type="text" placeholder="e.g. Yamaha R1M" required />
          </div>
          <div class="form-field">
            <label>Category (category_id)</label>
            <select v-model.number="productForm.category_id" class="form-select" required>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }} — {{ cat.description || ('Category #' + cat.id) }}
              </option>
              <option v-if="categories.length === 0" :value="1">Category 1 (Default)</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Price and Stock -->
        <div class="form-row">
          <div class="form-field">
            <label>Price ($ USD)</label>
            <div class="input-addon-wrap">
              <span class="input-addon-prefix">$</span>
              <input v-model.number="productForm.price" type="number" min="0" placeholder="10000" required />
            </div>
          </div>
          <div class="form-field">
            <label>Stock Quantity (stock)</label>
            <input v-model.number="productForm.stock" type="number" min="0" placeholder="10" required />
          </div>
        </div>

        <!-- Row 3: Year and Engine (engince) -->
        <div class="form-row">
          <div class="form-field">
            <label>Model Year (year)</label>
            <input v-model.number="productForm.year" type="number" min="1990" max="2035" placeholder="2026" required />
          </div>
          <div class="form-field">
            <label>Engine Displacement (engince)</label>
            <div class="input-addon-wrap">
              <input v-model.number="productForm.engince" type="number" min="50" max="3500" placeholder="999" required />
              <span class="input-addon">cc</span>
            </div>
          </div>
        </div>

        <!-- Row 4: Color with presets -->
        <div class="form-field full-width">
          <label>Color (color)</label>
          <div class="color-picker-row">
            <div class="color-input-wrap">
              <span class="color-preview-circle" :style="{ backgroundColor: getValidColor(productForm.color) }"></span>
              <input v-model="productForm.color" type="text" placeholder="e.g. white, black, blue, red" required />
            </div>
            <div class="color-preset-pills">
              <button
                v-for="preset in colorPresets"
                :key="preset.value"
                type="button"
                class="color-preset-btn"
                :class="{ active: productForm.color?.toLowerCase() === preset.value.toLowerCase() }"
                @click="productForm.color = preset.value"
                :title="preset.label"
              >
                <span class="color-swatch-sm" :style="{ backgroundColor: preset.hex }"></span>
                <span>{{ preset.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Row 5: Description -->
        <div class="form-field full-width">
          <label>Description (description)</label>
          <input v-model="productForm.description" type="text" placeholder="e.g. Bigbike" required />
        </div>

        <!-- Product Image File Upload with Live Dropzone & Preview -->
        <div class="form-field full-width">
          <div class="field-label-row">
            <label>Product Image</label>
            <span class="field-helper-badge">POST /products/:productId/image (multipart/form-data)</span>
          </div>

          <div
            class="image-upload-dropzone"
            :class="{ 'has-file': productPreviewUrl || editingProduct?.image }"
            @click="$refs.productFileInput.click()"
            @dragover.prevent
            @drop.prevent="onProductFileDrop"
          >
            <input
              ref="productFileInput"
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="onProductFileSelected"
            />

            <!-- Preview if file selected -->
            <div v-if="productPreviewUrl" class="upload-preview-active">
              <img :src="productPreviewUrl" alt="Product preview" class="preview-hero-img" />
              <div class="preview-details">
                <span class="preview-badge new-badge"><i class="fa fa-check"></i> Ready to Upload</span>
                <strong class="preview-file-title">{{ selectedProductFile?.name }}</strong>
                <span class="preview-file-size">{{ (selectedProductFile?.size / 1024).toFixed(1) }} KB</span>
                <span class="preview-hint">Click or drop to choose a different photo</span>
              </div>
              <button type="button" class="clear-file-btn" @click.stop="clearProductFile" title="Remove image">
                <i class="fa fa-times"></i>
              </button>
            </div>

            <!-- Current photo if editing without new file -->
            <div v-else-if="editingProduct?.image" class="upload-preview-active">
              <img :src="productImageUrl(editingProduct.image)" alt="Current photo" class="preview-hero-img" />
              <div class="preview-details">
                <span class="preview-badge current-badge">Current Photo</span>
                <strong class="preview-file-title">{{ editingProduct.image }}</strong>
                <span class="preview-hint">Click or drop to upload a new replacement photo</span>
              </div>
            </div>

            <!-- Empty dropzone state -->
            <div v-else class="upload-empty-content">
              <div class="upload-icon-circle">
                <i class="fa fa-camera"></i>
              </div>
              <div class="upload-text-wrap">
                <span class="upload-primary-text">Click to choose or drag &amp; drop bike photo</span>
                <span class="upload-secondary-text">PNG, JPG, WEBP up to 10MB • Uploaded via form-data</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress step banner during save -->
        <div v-if="isSavingProduct && saveProductStepText" class="saving-progress-banner">
          <i class="fa fa-spinner spin-anim"></i>
          <span>{{ saveProductStepText }}</span>
        </div>

        <div class="modal-form-actions">
          <BaseButton variant="secondary" size="md" type="button" @click="showProductModal = false" :disabled="isSavingProduct">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" size="md" type="submit" :loading="isSavingProduct" :loadingText="saveProductStepText || 'Saving...'">
            {{ editingProduct ? 'Save Changes (PATCH)' : 'Create Product (POST)' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Quick Photo Upload Modal (POST /products/:productId/image) -->
    <BaseModal v-model="showPhotoModal"
      :title="`Upload Bike Photo: ${photoEditingBike?.name || 'Product'}`"
      :subtitle="photoEditingBike ? `POST /products/${photoEditingBike.id || photoEditingBike._id}/image` : 'Upload image (form-data)'"
      size="md">
      <form @submit.prevent="saveQuickPhoto" class="modal-form">
        <div class="form-field full-width">
          <div
            class="image-upload-dropzone"
            :class="{ 'has-file': quickPhotoPreviewUrl || photoEditingBike?.image }"
            @click="$refs.quickPhotoInput.click()"
            @dragover.prevent
            @drop.prevent="onQuickPhotoDrop"
          >
            <input
              ref="quickPhotoInput"
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="onQuickPhotoSelected"
            />

            <!-- Preview if file selected -->
            <div v-if="quickPhotoPreviewUrl" class="upload-preview-active">
              <img :src="quickPhotoPreviewUrl" alt="New photo preview" class="preview-hero-img" />
              <div class="preview-details">
                <span class="preview-badge new-badge"><i class="fa fa-check"></i> New Photo Selected</span>
                <strong class="preview-file-title">{{ selectedQuickPhotoFile?.name }}</strong>
                <span class="preview-file-size">{{ (selectedQuickPhotoFile?.size / 1024).toFixed(1) }} KB</span>
                <span class="preview-hint">Click or drop to select a different image</span>
              </div>
              <button type="button" class="clear-file-btn" @click.stop="clearQuickPhoto" title="Remove selection">
                <i class="fa fa-times"></i>
              </button>
            </div>

            <!-- Current photo if no new file selected -->
            <div v-else-if="photoEditingBike?.image" class="upload-preview-active">
              <img :src="productImageUrl(photoEditingBike.image)" alt="Current photo" class="preview-hero-img" />
              <div class="preview-details">
                <span class="preview-badge current-badge">Current Photo</span>
                <strong class="preview-file-title">{{ photoEditingBike.image }}</strong>
                <span class="preview-hint">Click to choose a new photo file</span>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="upload-empty-content">
              <div class="upload-icon-circle">
                <i class="fa fa-cloud-upload"></i>
              </div>
              <div class="upload-text-wrap">
                <span class="upload-primary-text">Click or drop bike photo here</span>
                <span class="upload-secondary-text">PNG, JPG, WEBP • Uploads via form-data</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-form-actions">
          <BaseButton variant="secondary" size="md" type="button" @click="showPhotoModal = false" :disabled="isUploadingQuickPhoto">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" size="md" type="submit" :loading="isUploadingQuickPhoto" :disabled="!selectedQuickPhotoFile" :loadingText="'Uploading Photo...'">
            Upload Photo (POST)
          </BaseButton>
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
          <BaseButton variant="secondary" size="md" type="button" @click="showStockModal = false" :disabled="isSavingStock">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" size="md" type="submit" :loading="isSavingStock" :loadingText="'Updating...'">
            Update Stock
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Create Category Modal (POST /categories) -->
    <BaseModal v-model="showCategoryModal" title="Create New Category / Brand"
      subtitle="POST /categories" size="md">
      <form @submit.prevent="saveCategory" class="modal-form">
        <div class="form-field full-width">
          <label>Brand / Category Name (name)</label>
          <input v-model.trim="categoryForm.name" type="text" placeholder="e.g. YAMAHA, BMW, DUCATI" required />
        </div>

        <div class="form-field full-width">
          <label>Description</label>
          <textarea v-model.trim="categoryForm.description" rows="3" class="form-textarea"
            placeholder="e.g. High-performance superbikes and hyper-nakeds"></textarea>
        </div>

        <div class="modal-form-actions">
          <BaseButton variant="secondary" size="md" type="button" @click="showCategoryModal = false" :disabled="isSavingCategory">
            Cancel
          </BaseButton>
          <BaseButton variant="primary" size="md" type="submit" :loading="isSavingCategory" :disabled="!categoryForm.name" :loadingText="'Creating Category...'">
            Create Category (POST)
          </BaseButton>
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
import categoryService from '@/services/categoryService';
import BaseButton from '@/components/BaseButton.vue';
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
  categories: 'Brand & Category Management',
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

// ── Category Module State ─────────────────────────────
const categories = ref([]);
const isLoadingCategories = ref(false);
const isSavingCategory = ref(false);
const showCategoryModal = ref(false);
const categorySearchQuery = ref('');
const productCategoryFilter = ref('all');

const categoryForm = reactive({
  name: '',
  description: '',
});

const openCreateCategoryModal = () => {
  categoryForm.name = '';
  categoryForm.description = '';
  showCategoryModal.value = true;
};

const saveCategory = async () => {
  if (!categoryForm.name || !categoryForm.name.trim()) {
    toast.warning('Category brand name is required.', 'Missing Field');
    return;
  }
  isSavingCategory.value = true;
  try {
    await categoryService.createCategory({
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
    });
    toast.success(`Category "${categoryForm.name}" created successfully!`, 'Category Created');
    showCategoryModal.value = false;
    categoryForm.name = '';
    categoryForm.description = '';
    await fetchCategories();
  } catch (err) {
    const data = err.response?.data;
    let rawMsg = data?.message || data?.error || err.message || 'Failed to create category.';
    if (typeof rawMsg === 'object' && rawMsg !== null) {
      rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
    }
    const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
    toast.error(msg, 'Create Category Failed');
  } finally {
    isSavingCategory.value = false;
  }
};

const isDeletingCategory = ref(null);

const handleDeleteCategory = async (categoryId, categoryName) => {
  if (!confirm(`Are you sure you want to delete category "${categoryName || categoryId}"?`)) {
    return;
  }
  isDeletingCategory.value = categoryId;
  try {
    await categoryService.deleteCategory(categoryId);
    toast.success(`Category #${categoryId} deleted successfully!`, 'Category Deleted');
    await fetchCategories();
  } catch (err) {
    const data = err.response?.data;
    let rawMsg = data?.message || data?.error || err.message || 'Failed to delete category.';
    if (typeof rawMsg === 'object' && rawMsg !== null) {
      rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
    }
    const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
    toast.error(msg, 'Delete Category Failed');
  } finally {
    isDeletingCategory.value = null;
  }
};

// ── Product Module State ──────────────────────────────
const productSearchQuery = ref('');
const showProductModal = ref(false);
const showStockModal = ref(false);
const showPhotoModal = ref(false);
const editingProduct = ref(null);
const stockEditingBike = ref(null);
const photoEditingBike = ref(null);
const quickStockValue = ref(10);
const selectedProductFile = ref(null);
const productPreviewUrl = ref(null);
const selectedQuickPhotoFile = ref(null);
const quickPhotoPreviewUrl = ref(null);
const isUploadingQuickPhoto = ref(false);
const saveProductStepText = ref('');
const productFileInput = ref(null);
const quickPhotoInput = ref(null);

const productForm = reactive({
  name: 'Yamaha R1M',
  price: 10000,
  description: 'Bigbike',
  category_id: 1,
  stock: 10,
  year: 2026,
  engince: 999,
  color: 'white',
});

const sampleBikeTemplates = [
  {
    name: 'Yamaha R1M',
    price: 10000,
    description: 'Bigbike',
    stock: 10,
    year: 2026,
    engince: 999,
    color: 'white',
  },
  {
    name: 'Ducati Panigale V4 S',
    price: 29500,
    description: 'High-performance Italian superbike with Desmosedici Stradale V4',
    stock: 6,
    year: 2026,
    engince: 1103,
    color: 'red',
  },
  {
    name: 'BMW S1000RR M-Package',
    price: 24500,
    description: 'German hypersport powerhouse with ShiftCam technology',
    stock: 8,
    year: 2026,
    engince: 999,
    color: 'silver',
  },
  {
    name: 'Kawasaki Ninja H2 Carbon',
    price: 34000,
    description: 'Supercharged hypersport monster with carbon fiber fairings',
    stock: 4,
    year: 2026,
    engince: 998,
    color: 'black',
  },
];

const applyBikeTemplate = (tpl) => {
  productForm.name = tpl.name;
  productForm.price = tpl.price;
  productForm.description = tpl.description;
  productForm.stock = tpl.stock;
  productForm.year = tpl.year;
  productForm.engince = tpl.engince;
  productForm.color = tpl.color;
  if (categories.value.length > 0 && !productForm.category_id) {
    productForm.category_id = Number(categories.value[0].id);
  }
};

const colorPresets = [
  { label: 'White', value: 'white', hex: '#f8fafc' },
  { label: 'Black', value: 'black', hex: '#0f172a' },
  { label: 'Blue', value: 'blue', hex: '#2563eb' },
  { label: 'Red', value: 'red', hex: '#dc2626' },
  { label: 'Silver', value: 'silver', hex: '#94a3b8' },
  { label: 'Gray', value: 'gray', hex: '#4b5563' },
];

const getValidColor = (color) => {
  if (!color) return '#ffffff';
  return color;
};

// Products Data List
const products = ref([]);

// Fetch Products from GET /products/my with fallback to GET /products
const fetchProducts = async () => {
  try {
    let res = null;
    try {
      res = await productService.getMyProducts();
    } catch (e) {
      res = await productService.getAllProducts();
    }
    let list = res?.data || res;
    if (Array.isArray(list)) {
      products.value = list;
    } else if (list && Array.isArray(list.data)) {
      products.value = list.data;
    } else {
      res = await productService.getAllProducts();
      list = res?.data || res;
      products.value = Array.isArray(list) ? list : (list?.data || []);
    }
  } catch (err) {
    products.value = [];
  }
};

const refreshProducts = async () => {
  isRefreshing.value = true;
  try {
    await Promise.all([fetchProducts(), fetchCategories()]);
    toast.success('Inventory synced with server.', 'Inventory Refreshed');
  } catch (err) {
    //
  } finally {
    isRefreshing.value = false;
  }
};

const onProductFileSelected = (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  selectedProductFile.value = file;
  productPreviewUrl.value = URL.createObjectURL(file);
};

const onProductFileDrop = (e) => {
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  selectedProductFile.value = file;
  productPreviewUrl.value = URL.createObjectURL(file);
};

const clearProductFile = () => {
  selectedProductFile.value = null;
  productPreviewUrl.value = null;
  if (productFileInput.value) productFileInput.value.value = '';
};

const openCreateProductModal = () => {
  editingProduct.value = null;
  productForm.name = 'Yamaha R1M';
  productForm.price = 10000;
  productForm.description = 'Bigbike';
  productForm.category_id = categories.value.length > 0 ? Number(categories.value[0].id) : 1;
  productForm.stock = 10;
  productForm.year = 2026;
  productForm.engince = 999;
  productForm.color = 'white';
  selectedProductFile.value = null;
  productPreviewUrl.value = null;
  saveProductStepText.value = '';
  showProductModal.value = true;
};

const openEditProductModal = (bike) => {
  editingProduct.value = bike;
  productForm.name = bike.name || '';
  productForm.price = bike.price ?? 10000;
  productForm.description = bike.description || 'Bigbike';
  productForm.category_id = Number(bike.category_id ?? bike.categoryId ?? 1);
  productForm.stock = bike.stock ?? 10;
  productForm.year = bike.year ?? 2026;
  productForm.engince = bike.engince ?? bike.engine ?? 999;
  productForm.color = bike.color || 'white';
  selectedProductFile.value = null;
  productPreviewUrl.value = null;
  saveProductStepText.value = '';
  showProductModal.value = true;
};

const openStockModal = (bike) => {
  stockEditingBike.value = bike;
  quickStockValue.value = bike.stock ?? 10;
  showStockModal.value = true;
};

const openQuickPhotoModal = (bike) => {
  photoEditingBike.value = bike;
  selectedQuickPhotoFile.value = null;
  quickPhotoPreviewUrl.value = null;
  showPhotoModal.value = true;
};

const onQuickPhotoSelected = (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  selectedQuickPhotoFile.value = file;
  quickPhotoPreviewUrl.value = URL.createObjectURL(file);
};

const onQuickPhotoDrop = (e) => {
  const files = e.dataTransfer?.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  selectedQuickPhotoFile.value = file;
  quickPhotoPreviewUrl.value = URL.createObjectURL(file);
};

const clearQuickPhoto = () => {
  selectedQuickPhotoFile.value = null;
  quickPhotoPreviewUrl.value = null;
  if (quickPhotoInput.value) quickPhotoInput.value.value = '';
};

const saveQuickPhoto = async () => {
  if (!photoEditingBike.value || !selectedQuickPhotoFile.value) {
    toast.warning('Please select an image file to upload.', 'No Image Selected');
    return;
  }
  const bikeId = photoEditingBike.value.id || photoEditingBike.value._id;
  isUploadingQuickPhoto.value = true;
  try {
    await productService.uploadProductImage(bikeId, selectedQuickPhotoFile.value);
    toast.success(`Photo uploaded for ${photoEditingBike.value.name} (POST /products/${bikeId}/image)`, 'Photo Uploaded');
    showPhotoModal.value = false;
    await fetchProducts();
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to upload photo';
    toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg, 'Upload Error');
  } finally {
    isUploadingQuickPhoto.value = false;
  }
};

// Create or Update Product
const saveProduct = async () => {
  if (!productForm.name || !productForm.name.trim()) {
    toast.warning('Product name is required.', 'Missing Field');
    return;
  }
  if (!productForm.price || Number(productForm.price) <= 0) {
    toast.warning('Valid product price is required.', 'Invalid Price');
    return;
  }
  if (!productForm.category_id) {
    productForm.category_id = categories.value.length > 0 ? Number(categories.value[0].id) : 1;
  }

  isSavingProduct.value = true;
  saveProductStepText.value = editingProduct.value
    ? 'Saving updates (PATCH /products/:id)...'
    : 'Step 1/2: Submitting product specs (POST /products)...';

  try {
    const payload = {
      name: productForm.name.trim(),
      price: Number(productForm.price),
      description: productForm.description ? productForm.description.trim() : 'Bigbike',
      category_id: Number(productForm.category_id),
      stock: Number(productForm.stock ?? 0),
      year: Number(productForm.year || 2026),
      engince: Number(productForm.engince || 999),
      color: productForm.color ? productForm.color.trim() : 'white',
    };

    let targetId = null;

    if (editingProduct.value) {
      const bikeId = editingProduct.value.id || editingProduct.value._id;
      const res = await productService.updateProduct(bikeId, payload);
      const unwrapped = unwrapResponseData(res);
      targetId = unwrapped?.id || unwrapped?._id || bikeId;
      toast.success(`Product #${targetId} updated (PATCH /products/${targetId})`, 'Product Updated');
    } else {
      const res = await productService.createProduct(payload);
      const unwrapped = unwrapResponseData(res);
      targetId = unwrapped?.id || unwrapped?._id || unwrapped?.productId || res?.id || res?._id || res?.data?.id || res?.data?._id;
      toast.success(`Product "${payload.name}" created (POST /products)`, 'Product Created');
    }

    // Step 2: Upload product image via POST /products/:productId/image (multipart/form-data)
    if (selectedProductFile.value && targetId) {
      saveProductStepText.value = `Step 2/2: Uploading product image (POST /products/${targetId}/image)...`;
      try {
        await productService.uploadProductImage(targetId, selectedProductFile.value);
        toast.success(`Photo uploaded for product #${targetId}!`, 'Image Uploaded');
      } catch (imgErr) {
        console.error('Image upload failed:', imgErr);
        const imgMsg = imgErr.response?.data?.message || imgErr.message || 'Image upload failed';
        toast.warning(`Product was saved, but photo upload failed: ${imgMsg}`, 'Photo Notice');
      }
    }

    showProductModal.value = false;
    selectedProductFile.value = null;
    productPreviewUrl.value = null;
    await fetchProducts();
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to save product';
    toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg, 'Save Error');
  } finally {
    isSavingProduct.value = false;
    saveProductStepText.value = '';
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

// ── Category Fetching & Helpers ───────────────────────
const fetchCategories = async () => {
  isLoadingCategories.value = true;
  try {
    const res = await categoryService.getAllCategories();
    // Shape: { result: true, message: "...", data: [ { id: 1, name: "BMW", description: "..." } ] }
    const payload = res?.data ?? res;
    if (Array.isArray(payload)) {
      categories.value = payload;
    } else if (payload && Array.isArray(payload.data)) {
      categories.value = payload.data;
    } else {
      categories.value = [];
    }
  } catch (err) {
    console.warn('Failed to load categories:', err);
    categories.value = [];
  } finally {
    isLoadingCategories.value = false;
  }
};

const getCategoryName = (categoryId) => {
  if (!categoryId) return 'General';
  const found = categories.value.find((c) => Number(c.id) === Number(categoryId));
  return found ? found.name : `Cat #${categoryId}`;
};

const filteredCategories = computed(() => {
  const q = categorySearchQuery.value.toLowerCase();
  return categories.value.filter((cat) => {
    const name = (cat.name || '').toLowerCase();
    const desc = (cat.description || '').toLowerCase();
    return name.includes(q) || desc.includes(q);
  });
});

// Filtered Lists
const productStockFilter = ref('all');

const getAvatarColor = (name) => {
  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
  const idx = (name || 'B').charCodeAt(0) % colors.length;
  return colors[idx];
};

const getStockPercent = (stock) => {
  const s = stock ?? 0;
  if (s === 0) return 0;
  return Math.min(100, Math.round((s / 20) * 100));
};

const getStockBarClass = (stock) => {
  const s = stock ?? 0;
  if (s === 0) return 'bar-out';
  if (s <= 2) return 'bar-low';
  return 'bar-in';
};

const filteredProducts = computed(() => {
  return products.value.filter((bike) => {
    const q = productSearchQuery.value.toLowerCase();
    const nameMatch = (bike.name || '').toLowerCase().includes(q);
    const descMatch = (bike.description || '').toLowerCase().includes(q);
    const idMatch = String(bike.id || bike._id || '').includes(q);
    const matchesSearch = nameMatch || descMatch || idMatch;
    const matchesCategory =
      productCategoryFilter.value === 'all' ||
      Number(bike.category_id) === Number(productCategoryFilter.value);
    const s = bike.stock ?? 0;
    const matchesStock =
      productStockFilter.value === 'all' ||
      (productStockFilter.value === 'in' && s > 2) ||
      (productStockFilter.value === 'low' && s > 0 && s <= 2) ||
      (productStockFilter.value === 'out' && s === 0);
    return matchesSearch && matchesCategory && matchesStock;
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
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://') || avatarPath.startsWith('data:') || avatarPath.startsWith('blob:')) {
    return avatarPath;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  let clean = avatarPath.replace(/^\//, '');
  if (!clean.startsWith('uploads/')) {
    clean = `uploads/profiles/${clean}`;
  }
  return `${apiBase}/${clean}`;
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
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  let clean = imagePath.replace(/^\//, '');
  if (!clean.startsWith('uploads/')) {
    clean = `uploads/products/${clean}`;
  }
  return `${apiBase}/${clean}`;
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

const isDeletingUser = ref(null);

const handleDeleteUser = async (userId, userName) => {
  if (authStore.userId && Number(userId) === Number(authStore.userId)) {
    toast.warning('You cannot delete your own admin account.', 'Action Not Allowed');
    return;
  }
  if (!confirm(`Are you sure you want to delete rider/user "${userName || userId}"?`)) {
    return;
  }
  isDeletingUser.value = userId;
  try {
    await userService.deleteUser(userId);
    toast.success(`User #${userId} deleted successfully! (DELETE /users/:id)`, 'User Deleted');
    await fetchUsers(1);
  } catch (err) {
    const data = err.response?.data;
    let rawMsg = data?.message || data?.error || err.message || 'Failed to delete user.';
    if (typeof rawMsg === 'object' && rawMsg !== null) {
      rawMsg = rawMsg.message || rawMsg.error || JSON.stringify(rawMsg);
    }
    const msg = Array.isArray(rawMsg) ? rawMsg.join(', ') : String(rawMsg);
    toast.error(msg, 'Delete User Failed');
  } finally {
    isDeletingUser.value = null;
  }
};

const refreshAllModules = async () => {
  isRefreshing.value = true;
  try {
    await Promise.all([fetchProducts(), fetchOrders(), fetchUsers(1), fetchCategories()]);
    toast.success('All telemetry and data synchronized.', 'Data Refreshed');
  } finally {
    isRefreshing.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchOrders(), fetchUsers(1), fetchCategories()]);
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
  width: 200px;
  min-width: 200px;
  height: 100vh;
  background: #0d1117;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.85rem;
  z-index: 100;
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1.5rem;
  margin-bottom: 0.5rem;
}

.brand-logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.brand-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.8rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
}

.brand-sub {
  font-size: 0.68rem;
  color: #4b5563;
  font-weight: 500;
}

.mobile-close-btn {
  display: none;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
}

/* Nav Menu in Sidebar */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: left;
}

.nav-item-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.nav-icon {
  font-size: 1rem;
  width: 1rem;
  text-align: center;
}

.nav-label {
  letter-spacing: -0.01em;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #d1d5db;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.06);
  color: #f9fafb;
  font-weight: 600;
}

.nav-count {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 20px;
  min-width: 20px;
  text-align: center;
}

.cyan-count { background: rgba(56,189,248,0.1); color: #38bdf8; }
.amber-count { background: rgba(245,158,11,0.1); color: #fbbf24; }
.emerald-count { background: rgba(16,185,129,0.1); color: #34d399; }
.purple-count { background: rgba(168,85,247,0.1); color: #c084fc; }

/* Category cells */
.category-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #c084fc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
}

.category-brand-name {
  color: #f8fafc;
  font-weight: 700;
  font-size: 0.95rem;
}

/* Sidebar Footer – User Row */
.sidebar-footer {
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-user-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.25rem;
}

.sidebar-user-avatar {
  position: relative;
  overflow: hidden;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-user-avatar img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.sidebar-user-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.sidebar-user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-email {
  font-size: 0.68rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-logout-icon {
  background: transparent;
  border: none;
  color: #4b5563;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: color 0.2s;
  flex-shrink: 0;
}

.sidebar-logout-icon:hover { color: #fb7185; }

/* Keep legacy footer-action-btn for fallback */
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
  margin-left: 200px;
  width: calc(100% - 200px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #111827;
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
  padding: 1.75rem 2rem 4rem 2rem;
  flex: 1;
}

.tab-pane-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Section Headings */
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.heading-btn-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 1.55rem;
  font-weight: 700;
  color: #f9fafb;
  margin: 0;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 0.84rem;
  color: #6b7280;
  margin: 0.2rem 0 0;
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

/* ── STATS CARDS ROW ────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: #1a2234;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stat-label {
  font-size: 0.78rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-size: 1.55rem;
  font-weight: 700;
  color: #f9fafb;
  line-height: 1.1;
}

/* ── 3. MODULE PANELS & DATA TABLES ──────────────────────── */
.module-panel {
  background: #1a2234;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  overflow: hidden;
}

.module-control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-bar-right {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.filter-select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.filter-select-chevron {
  position: absolute;
  right: 0.65rem;
  color: #6b7280;
  font-size: 0.75rem;
  pointer-events: none;
}

.stock-filter-pills {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  padding: 0.2rem;
  gap: 0.15rem;
}

.stock-pill {
  padding: 0.25rem 0.7rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.stock-pill:hover { color: #d1d5db; }

.stock-pill.active {
  background: #1e293b;
  color: #f9fafb;
}

.stock-pill.out.active {
  background: rgba(244, 63, 94, 0.18);
  color: #fb7185;
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
  gap: 0.75rem;
}

.bike-avatar-circle {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  background: #152238;
}

.bike-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bike-avatar-circle img[style*='display: none'] + .avatar-fallback {
  display: flex;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.bike-name {
  color: #f9fafb;
  font-size: 0.88rem;
  font-weight: 600;
}

.bike-specs-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.1rem;
}

.spec-meta {
  font-size: 0.72rem;
  color: #6b7280;
}

.spec-sep {
  font-size: 0.72rem;
  color: #374151;
  margin: 0 0.15rem;
}

.bike-id {
  font-size: 0.72rem;
  color: #38bdf8;
}

.price-tag {
  color: #f9fafb;
  font-size: 0.88rem;
  font-weight: 600;
}

.category-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  background: rgba(255,255,255,0.07);
  color: #d1d5db;
  border: 1px solid rgba(255,255,255,0.08);
}

/* New stock cell with progress bar */
.stock-cell-new {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 130px;
}

.stock-num {
  font-size: 0.85rem;
  font-weight: 600;
  color: #d1d5db;
  min-width: 18px;
  text-align: right;
}

.stock-bar-wrap {
  flex: 1;
  height: 5px;
  background: rgba(255,255,255,0.08);
  border-radius: 99px;
  overflow: hidden;
}

.stock-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}

.bar-in { background: #22c55e; }
.bar-low { background: #f59e0b; }
.bar-out { background: #ef4444; width: 0 !important; }

.stock-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-number { color: #f8fafc; }

.stock-edit-btn {
  padding: 0.2rem 0.4rem;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: #6b7280;
  border-radius: 5px;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.stock-edit-btn:hover {
  background: rgba(56,189,248,0.1);
  border-color: #38bdf8;
  color: #38bdf8;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.74rem;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-in-stock {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
}
.status-in-stock .status-dot { background: #4ade80; }

.status-low-stock {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
}
.status-low-stock .status-dot { background: #fbbf24; }

.status-out-of-stock {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}
.status-out-of-stock .status-dot { background: #f87171; }

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
}

.tbl-btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.16s ease;
  border: 1px solid #233554;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: #152238;
  color: #64748b;
}

.tbl-btn-icon.delete:hover {
  background: #22141c;
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.4);
}

.tbl-btn {
  padding: 0.38rem 0.85rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.16s ease;
  border: 1px solid #233554;
  font-family: inherit;
  background: #152238;
  color: #cbd5e1;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.tbl-btn:hover {
  background: #1c2e4c;
  color: #ffffff;
  border-color: #3b82f6;
}

.tbl-btn.edit {
  background: #152238;
  color: #cbd5e1;
  border-color: #233554;
}

.tbl-btn.edit:hover {
  background: #1c2e4c;
  color: #ffffff;
  border-color: #3b82f6;
}

.tbl-btn.delete {
  background: #22141c;
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.25);
}

.tbl-btn.delete:hover {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
}

.tbl-btn.view {
  background: #152238;
  color: #cbd5e1;
  border-color: #233554;
}

.tbl-btn.view:hover {
  background: #1c2e4c;
  color: #ffffff;
  border-color: #3b82f6;
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
.form-field input[type="number"],
.form-field textarea,
.form-textarea,
.form-field select,
.form-select {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  color: #f8fafc;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
  width: 100%;
}

.form-field select option {
  background: #0f172a;
  color: #f8fafc;
}

.form-field input:focus,
.form-field textarea:focus,
.form-textarea:focus,
.form-field select:focus,
.form-select:focus {
  border-color: #38bdf8;
}

/* Addon input wrap ($ and cc) */
.input-addon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-addon-wrap input {
  width: 100%;
}

.input-addon-prefix {
  position: absolute;
  left: 0.85rem;
  color: #94a3b8;
  font-weight: 700;
  font-size: 0.9rem;
  pointer-events: none;
}

.input-addon-wrap:has(.input-addon-prefix) input {
  padding-left: 1.75rem;
}

.input-addon {
  position: absolute;
  right: 0.85rem;
  color: #94a3b8;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  pointer-events: none;
}

.input-addon-wrap:has(.input-addon) input {
  padding-right: 2.5rem;
}

/* Color picker row */
.color-picker-row {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.color-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.color-preview-circle {
  position: absolute;
  left: 0.75rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
}

.color-input-wrap input {
  padding-left: 2.35rem;
}

.color-preset-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.color-preset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(71, 85, 105, 0.4);
  border-radius: 8px;
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-preset-btn:hover {
  border-color: #38bdf8;
  color: #ffffff;
}

.color-preset-btn.active {
  border-color: #38bdf8;
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
}

.color-swatch-sm {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Table specs badges */
.bike-specs-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
}

.spec-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  background: rgba(30, 41, 59, 0.7);
  color: #94a3b8;
  border: 1px solid rgba(71, 85, 105, 0.4);
  font-family: inherit;
}

.spec-tag.year-tag {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
  background: rgba(14, 165, 233, 0.1);
}

.spec-tag.engine-tag {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.1);
}

.spec-tag.cat-tag {
  color: #a855f7;
  border-color: rgba(168, 85, 247, 0.3);
  background: rgba(168, 85, 247, 0.1);
}

.spec-tag.color-tag {
  color: #e2e8f0;
}

.color-mini-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* ── Product Concept Stepper & Presets ───────────────── */
.product-concept-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 12px;
  padding: 0.75rem 1.15rem;
  margin-bottom: 0.25rem;
}

.stepper-step {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.stepper-step.active {
  opacity: 1;
}

.stepper-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stepper-step.active .stepper-num {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
}

.stepper-meta {
  display: flex;
  flex-direction: column;
}

.stepper-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #f8fafc;
}

.stepper-code {
  font-size: 0.68rem;
  font-family: monospace;
  color: #38bdf8;
}

.stepper-arrow {
  color: #475569;
  font-size: 0.85rem;
}

/* Preset Templates Bar */
.preset-templates-bar {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  padding: 0.5rem 0.75rem;
  background: rgba(30, 41, 59, 0.4);
  border: 1px dashed rgba(71, 85, 105, 0.4);
  border-radius: 10px;
}

.preset-templates-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #fbbf24;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.preset-template-buttons {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tpl-pill-btn {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #cbd5e1;
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.tpl-pill-btn:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: #38bdf8;
  color: #38bdf8;
}

.tpl-pill-btn.active {
  background: #0284c7;
  border-color: #38bdf8;
  color: #ffffff;
}

/* Field Label Helper Row */
.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.field-helper-badge {
  font-size: 0.68rem;
  font-family: monospace;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

/* Modern Image Upload Dropzone */
.image-upload-dropzone {
  position: relative;
  border: 2px dashed rgba(71, 85, 105, 0.6);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.6);
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-dropzone:hover {
  border-color: #38bdf8;
  background: rgba(14, 165, 233, 0.05);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.1);
}

.image-upload-dropzone.has-file {
  border-style: solid;
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(15, 23, 42, 0.85);
}

.hidden-file-input {
  display: none;
}

.upload-empty-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.upload-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.upload-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.upload-primary-text {
  font-size: 0.88rem;
  font-weight: 700;
  color: #f1f5f9;
}

.upload-secondary-text {
  font-size: 0.74rem;
  color: #64748b;
}

/* Upload Preview */
.upload-preview-active {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.preview-hero-img {
  width: 76px;
  height: 76px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  background: #0b0f19;
  flex-shrink: 0;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.preview-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  width: fit-content;
}

.preview-badge.new-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.preview-badge.current-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.preview-file-title {
  font-size: 0.85rem;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-file-size {
  font-size: 0.72rem;
  color: #94a3b8;
  font-family: monospace;
}

.preview-hint {
  font-size: 0.7rem;
  color: #64748b;
  font-style: italic;
}

.clear-file-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fb7185;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.clear-file-btn:hover {
  background: rgba(244, 63, 94, 0.25);
  color: #ffffff;
  border-color: #fb7185;
}

.saving-progress-banner {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  color: #38bdf8;
  font-size: 0.82rem;
  font-weight: 600;
}

.bike-avatar-circle {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.bike-avatar-circle:hover {
  transform: scale(1.08);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
}

.modal-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.modal-btn {
  padding: 0.52rem 1.15rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.16s ease;
  border: 1px solid transparent;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.modal-btn.cancel {
  background: #152238;
  color: #cbd5e1;
  border: 1px solid #233554;
  font-weight: 500;
}

.modal-btn.cancel:hover {
  background: #1c2e4c;
  color: #ffffff;
  border-color: #3b82f6;
}

.modal-btn.confirm {
  background: #3b82f6;
  color: #000000;
  border: none;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.modal-btn.confirm:hover:not(:disabled) {
  background: #60a5fa;
  color: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
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
    padding: 1.25rem 1rem 3rem 1rem;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
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
