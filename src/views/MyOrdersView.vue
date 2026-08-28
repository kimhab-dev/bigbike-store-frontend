<template>
  <div class="orders-page">
    <div class="bg-glow glow-1"></div>
    <div class="bg-glow glow-2"></div>

    <div class="orders-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="fa fa-shopping-bag title-icon"></i>
            My Orders
          </h1>
          <p class="page-subtitle">Track and manage your BigBike Store orders</p>
        </div>
        <button class="create-btn" @click="goToShowroom" id="btn-create-order">
          <i class="fa fa-plus"></i>
          <span>New Order</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="state-center">
        <div class="state-spinner"></div>
        <p>Loading your orders...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-center">
        <div class="state-icon error-icon">
          <i class="fa fa-exclamation-triangle"></i>
        </div>
        <h3>Failed to Load Orders</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchOrders">
          <i class="fa fa-refresh"></i> Retry
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="orders.length === 0" class="state-center">
        <div class="empty-icon">
          <i class="fa fa-shopping-basket"></i>
        </div>
        <h3>No Orders Yet</h3>
        <p>Browse our showroom and place your first order!</p>
        <button class="create-btn" @click="goToShowroom">
          <i class="fa fa-motorcycle"></i> Browse Products
        </button>
      </div>

      <!-- Orders Table -->
      <div v-else class="orders-content">
        <div class="table-wrapper">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id" class="order-row">
                <td>
                  <span class="order-id">#{{ order.id }}</span>
                </td>
                <td>
                  <div class="user-cell">
                    <span class="user-name">{{ order.user?.name || 'Account #' + (order.user?.id || order.id) }}</span>
                    <span v-if="order.user?.email" class="user-email-sub">{{ order.user?.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="order-total">{{ formatPrice(order.total) }}</span>
                </td>
                <td>
                  <span :class="['status-badge', statusClass(order.status)]">
                    {{ order.status || 'Active' }}
                  </span>
                </td>
                <td>
                  <span class="date-cell">{{ formatDate(order.createdAt) }}</span>
                </td>
                <td>
                  <div class="action-btns">
                    <button
                      class="act-btn view-btn"
                      title="View detail"
                      :id="`btn-view-order-${order.id}`"
                      @click="openDetailModal(order.id)"
                    >
                      <i class="fa fa-eye"></i>
                    </button>
                    <button
                      class="act-btn edit-btn"
                      title="Patch order"
                      :id="`btn-patch-order-${order.id}`"
                      @click="openPatchModal(order)"
                    >
                      <i class="fa fa-pencil"></i>
                    </button>
                    <button
                      class="act-btn del-btn"
                      title="Delete order"
                      :id="`btn-delete-order-${order.id}`"
                      @click="confirmDelete(order)"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
            id="btn-prev-page"
          >
            <i class="fa fa-chevron-left"></i> Prev
          </button>
          <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            class="page-btn"
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
            id="btn-next-page"
          >
            Next <i class="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ── CREATE ORDER MODAL ─────────────────────── -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
        <div class="modal-box" id="modal-create-order">
          <div class="modal-header">
            <h2 class="modal-title"><i class="fa fa-shopping-cart"></i> Create New Order</h2>
            <button class="modal-close" @click="closeCreateModal"><i class="fa fa-times"></i></button>
          </div>

          <div class="modal-body">
            <p class="modal-hint">Add one or more items to your order.</p>

            <div v-for="(item, idx) in createItems" :key="idx" class="item-row">
              <div class="form-group">
                <label :for="`create-product-${idx}`">Product ID</label>
                <input
                  :id="`create-product-${idx}`"
                  v-model.number="item.productId"
                  type="number"
                  min="1"
                  class="form-input"
                  placeholder="e.g. 9"
                />
              </div>
              <div class="form-group">
                <label :for="`create-qty-${idx}`">Quantity</label>
                <input
                  :id="`create-qty-${idx}`"
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="form-input"
                  placeholder="e.g. 2"
                />
              </div>
              <button
                v-if="createItems.length > 1"
                class="remove-item-btn"
                @click="removeCreateItem(idx)"
                title="Remove item"
              ><i class="fa fa-times"></i></button>
            </div>

            <button class="add-item-btn" @click="addCreateItem" id="btn-add-item">
              <i class="fa fa-plus"></i> Add Another Item
            </button>
          </div>

          <div class="modal-footer">
            <button class="footer-btn cancel-btn" @click="closeCreateModal">Cancel</button>
            <button
              class="footer-btn confirm-btn"
              :disabled="creatingOrder"
              @click="submitCreateOrder"
              id="btn-submit-order"
            >
              <span v-if="creatingOrder" class="btn-spinner"></span>
              {{ creatingOrder ? 'Creating...' : 'Place Order' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── ORDER DETAIL MODAL ─────────────────────── -->
    <Teleport to="body">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
        <div class="modal-box" id="modal-order-detail">
          <div class="modal-header">
            <h2 class="modal-title"><i class="fa fa-search"></i> Order Detail</h2>
            <button class="modal-close" @click="closeDetailModal"><i class="fa fa-times"></i></button>
          </div>

          <div class="modal-body">
            <div v-if="detailLoading" class="modal-loading">
              <div class="state-spinner"></div>
              <p>Loading...</p>
            </div>

            <div v-else-if="detailOrder" class="detail-grid-modal">
              <div class="detail-row">
                <span class="detail-k">Order ID</span>
                <span class="detail-v">#{{ detailOrder.id }}</span>
              </div>
              <div v-if="detailOrder.user" class="detail-row">
                <span class="detail-k">Customer</span>
                <span class="detail-v">
                  <strong>{{ detailOrder.user.name || 'User #' + detailOrder.user.id }}</strong>
                  <span v-if="detailOrder.user.email" class="detail-sub-email"> ({{ detailOrder.user.email }})</span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-k">Status</span>
                <span :class="['status-badge', statusClass(detailOrder.status)]">{{ detailOrder.status || 'Active' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-k">Total</span>
                <span class="detail-v price-v">{{ formatPrice(detailOrder.total) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-k">Created</span>
                <span class="detail-v">{{ formatDate(detailOrder.createdAt) }}</span>
              </div>
              <div v-if="detailOrder.updatedAt" class="detail-row">
                <span class="detail-k">Updated</span>
                <span class="detail-v">{{ formatDate(detailOrder.updatedAt) }}</span>
              </div>

              <div class="items-section">
                <span class="detail-k">Items</span>
                <div class="items-list">
                  <div
                    v-for="(item, idx) in (detailOrder.items || [])"
                    :key="idx"
                    class="detail-item-card"
                  >
                    <span class="di-label">Product</span>
                    <span class="di-val">#{{ item.productId ?? item.product?.id }}</span>
                    <span class="di-label">Qty</span>
                    <span class="di-val">{{ item.quantity }}</span>
                    <span v-if="item.price" class="di-label">Price</span>
                    <span v-if="item.price" class="di-val">{{ formatPrice(item.price) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="footer-btn cancel-btn" @click="closeDetailModal">Close</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── PATCH ORDER MODAL ──────────────────────── -->
    <Teleport to="body">
      <div v-if="showPatchModal" class="modal-overlay" @click.self="closePatchModal">
        <div class="modal-box" id="modal-patch-order">
          <div class="modal-header">
            <h2 class="modal-title"><i class="fa fa-pencil"></i> Patch Order <span class="modal-id">#{{ patchOrderId }}</span></h2>
            <button class="modal-close" @click="closePatchModal"><i class="fa fa-times"></i></button>
          </div>

          <div class="modal-body">
            <p class="modal-hint">Update a product reference or override the order total.</p>
            <div class="form-group">
              <label for="patch-productId">Product ID</label>
              <input
                id="patch-productId"
                v-model.number="patchForm.productId"
                type="number"
                min="1"
                class="form-input"
                placeholder="e.g. 1"
              />
            </div>
            <div class="form-group">
              <label for="patch-total">Total (override)</label>
              <input
                id="patch-total"
                v-model.number="patchForm.total"
                type="number"
                min="0"
                class="form-input"
                placeholder="e.g. 20"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="footer-btn cancel-btn" @click="closePatchModal">Cancel</button>
            <button
              class="footer-btn confirm-btn"
              :disabled="patchingOrder"
              @click="submitPatch"
              id="btn-submit-patch"
            >
              <span v-if="patchingOrder" class="btn-spinner"></span>
              {{ patchingOrder ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── DELETE CONFIRM MODAL ───────────────────── -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-box modal-sm" id="modal-delete-confirm">
          <div class="modal-header">
            <h2 class="modal-title danger-title"><i class="fa fa-trash"></i> Delete Order</h2>
            <button class="modal-close" @click="closeDeleteModal"><i class="fa fa-times"></i></button>
          </div>
          <div class="modal-body">
            <p class="confirm-msg">
              Are you sure you want to delete <strong>Order #{{ deleteTargetId }}</strong>?
              This action <strong>cannot be undone</strong>.
            </p>
          </div>
          <div class="modal-footer">
            <button class="footer-btn cancel-btn" @click="closeDeleteModal">Cancel</button>
            <button
              class="footer-btn danger-btn"
              :disabled="deletingOrder"
              @click="submitDelete"
              id="btn-confirm-delete"
            >
              <span v-if="deletingOrder" class="btn-spinner"></span>
              {{ deletingOrder ? 'Deleting...' : 'Yes, Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';
import orderService from '@/services/orderService';

const toast = useToast();
const router = useRouter();

// Navigate to showroom (product list)
const goToShowroom = () => router.push('/#featured-fleet');

// ── State ────────────────────────────────────────────
const orders      = ref([]);
const loading     = ref(false);
const error       = ref(null);
const currentPage = ref(1);
const limit       = ref(10);
const total       = ref(0);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));

// ── Fetch my orders ───────────────────────────────────
const fetchOrders = async () => {
  loading.value = true;
  error.value   = null;
  try {
    const res = await orderService.getMyOrders({ page: currentPage.value, limit: limit.value });
    
    // Check for nested response: { result: true, data: { items: [...], pagination: { ... } } }
    if (res?.data?.items && Array.isArray(res.data.items)) {
      orders.value = res.data.items;
      total.value  = res.data.pagination?.total ?? res.data.items.length;
    } else if (res?.items && Array.isArray(res.items)) {
      orders.value = res.items;
      total.value  = res.pagination?.total ?? res.items.length;
    } else if (res && Array.isArray(res.data)) {
      orders.value = res.data;
      total.value  = res.total ?? res.data.length;
    } else if (Array.isArray(res)) {
      orders.value = res;
      total.value  = res.length;
    } else {
      orders.value = [];
      total.value  = 0;
    }
  } catch (err) {
    error.value = err?.response?.data?.message || err.message || 'Failed to load orders';
    toast.error(error.value, 'Load Error');
  } finally {
    loading.value = false;
  }
};

const changePage = (page) => {
  currentPage.value = page;
  fetchOrders();
};

// ── Helpers ───────────────────────────────────────────
const formatPrice = (val) => {
  if (val == null) return '—';
  return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusClass = (status) => {
  const s = (status || 'pending').toLowerCase();
  if (s === 'completed' || s === 'delivered') return 'status-completed';
  if (s === 'cancelled' || s === 'canceled')  return 'status-cancelled';
  if (s === 'processing')                      return 'status-processing';
  return 'status-pending';
};

// ── Create Order ──────────────────────────────────────
const showCreateModal = ref(false);
const creatingOrder   = ref(false);
const createItems     = ref([{ productId: null, quantity: 1 }]);

const openCreateModal = () => {
  createItems.value = [{ productId: null, quantity: 1 }];
  showCreateModal.value = true;
};
const closeCreateModal = () => { showCreateModal.value = false; };
const addCreateItem    = () => { createItems.value.push({ productId: null, quantity: 1 }); };
const removeCreateItem = (idx) => { createItems.value.splice(idx, 1); };

const submitCreateOrder = async () => {
  const items = createItems.value.filter(i => i.productId && i.quantity > 0);
  if (items.length === 0) {
    toast.warning('Add at least one valid item.', 'Validation');
    return;
  }
  creatingOrder.value = true;
  try {
    await orderService.createOrder({ items });
    toast.success('Order placed successfully!', 'Order Created');
    closeCreateModal();
    currentPage.value = 1;
    await fetchOrders();
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to create order';
    toast.error(msg, 'Create Error');
  } finally {
    creatingOrder.value = false;
  }
};

// ── Detail Modal ──────────────────────────────────────
const showDetailModal = ref(false);
const detailLoading   = ref(false);
const detailOrder     = ref(null);

const openDetailModal = async (orderId) => {
  showDetailModal.value = true;
  detailLoading.value   = true;
  detailOrder.value     = null;
  try {
    const res = await orderService.getOrderById(orderId);
    detailOrder.value = res?.data ?? res;
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to load order';
    toast.error(msg, 'Detail Error');
    showDetailModal.value = false;
  } finally {
    detailLoading.value = false;
  }
};
const closeDetailModal = () => { showDetailModal.value = false; };

// ── Patch Modal ───────────────────────────────────────
const showPatchModal = ref(false);
const patchingOrder  = ref(false);
const patchOrderId   = ref(null);
const patchForm      = ref({ productId: null, total: null });

const openPatchModal = (order) => {
  patchOrderId.value    = order.id;
  patchForm.value       = { productId: order.items?.[0]?.productId ?? null, total: order.total ?? null };
  showPatchModal.value  = true;
};
const closePatchModal = () => { showPatchModal.value = false; };

const submitPatch = async () => {
  const body = {};
  if (patchForm.value.productId) body.productId = patchForm.value.productId;
  if (patchForm.value.total != null) body.total = patchForm.value.total;

  if (Object.keys(body).length === 0) {
    toast.warning('Provide at least one field to update.', 'Validation');
    return;
  }
  patchingOrder.value = true;
  try {
    await orderService.patchOrder(patchOrderId.value, body);
    toast.success(`Order #${patchOrderId.value} updated.`, 'Order Updated');
    closePatchModal();
    await fetchOrders();
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to patch order';
    toast.error(msg, 'Patch Error');
  } finally {
    patchingOrder.value = false;
  }
};

// ── Delete Modal ──────────────────────────────────────
const showDeleteModal  = ref(false);
const deletingOrder    = ref(false);
const deleteTargetId   = ref(null);

const confirmDelete  = (order) => { deleteTargetId.value = order.id; showDeleteModal.value = true; };
const closeDeleteModal = () => { showDeleteModal.value = false; };

const submitDelete = async () => {
  deletingOrder.value = true;
  try {
    await orderService.deleteOrder(deleteTargetId.value);
    toast.success(`Order #${deleteTargetId.value} deleted.`, 'Deleted');
    closeDeleteModal();
    if (orders.value.length === 1 && currentPage.value > 1) currentPage.value--;
    await fetchOrders();
  } catch (err) {
    const msg = err?.response?.data?.message || err.message || 'Failed to delete order';
    toast.error(msg, 'Delete Error');
  } finally {
    deletingOrder.value = false;
  }
};

// ── Init ──────────────────────────────────────────────
onMounted(fetchOrders);
</script>

<style scoped>
/* ── Page shell ── */
.orders-page {
  min-height: calc(100vh - 70px);
  background: #070a12;
  color: #f8fafc;
  padding: 2.5rem 1.5rem 5rem;
  position: relative;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}
.glow-1 {
  width: 500px; height: 500px;
  background: rgba(14, 165, 233, 0.07);
  top: -120px; left: -100px;
}
.glow-2 {
  width: 400px; height: 400px;
  background: rgba(99, 102, 241, 0.07);
  bottom: 60px; right: -80px;
}

.orders-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Header ── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-icon { font-size: 1.6rem; margin-right: 0.5rem; }

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  display: flex;
  align-items: center;
}

.page-subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

/* ── Create button ── */
.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);
  transition: all 0.2s;
}
.create-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(14, 165, 233, 0.55); }
.btn-icon { width: 1rem; height: 1rem; }

/* ── State center ── */
.state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
  color: #64748b;
  text-align: center;
}
.state-spinner {
  width: 38px; height: 38px;
  border: 3px solid #1e293b;
  border-top-color: #0ea5e9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.empty-icon { font-size: 3.5rem; }
.state-center h3 { font-size: 1.2rem; font-weight: 700; color: #94a3b8; margin: 0; }
.state-center p  { font-size: 0.9rem; margin: 0; }
.retry-btn {
  padding: 0.5rem 1.2rem;
  background: #1e293b;
  border: 1px solid #334155;
  color: #94a3b8;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}
.retry-btn:hover { border-color: #0ea5e9; color: #0ea5e9; }

/* ── Table ── */
.table-wrapper {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(51, 65, 85, 0.5);
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.orders-table thead tr {
  border-bottom: 1px solid rgba(51, 65, 85, 0.6);
}
.orders-table th {
  padding: 1rem 1.2rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #475569;
  text-transform: uppercase;
}
.orders-table td {
  padding: 1rem 1.2rem;
  border-bottom: 1px solid rgba(30, 41, 59, 0.6);
  vertical-align: middle;
}
.order-row:last-child td { border-bottom: none; }
.order-row:hover td { background: rgba(30, 41, 59, 0.4); }

.order-id { font-weight: 700; color: #38bdf8; font-family: monospace; }

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.user-name {
  font-weight: 600;
  color: #f8fafc;
  font-size: 0.88rem;
}
.user-email-sub {
  font-size: 0.76rem;
  color: #64748b;
}

.detail-sub-email {
  font-size: 0.82rem;
  color: #94a3b8;
  font-weight: normal;
}

.items-preview { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.item-chip {
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(14, 165, 233, 0.25);
  color: #7dd3fc;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-family: monospace;
}
.item-more { font-size: 0.75rem; color: #64748b; align-self: center; }

.order-total { font-weight: 700; color: #a3e635; }

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.status-pending    { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,.3); }
.status-processing { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,.3); }
.status-completed  { background: rgba(34, 197, 94, 0.15);  color: #4ade80; border: 1px solid rgba(34,197,94,.3); }
.status-cancelled  { background: rgba(244, 63, 94, 0.15);  color: #fb7185; border: 1px solid rgba(244,63,94,.3); }

.date-cell { font-size: 0.82rem; color: #64748b; }

/* ── Action buttons ── */
.action-btns { display: flex; gap: 0.5rem; }
.act-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.act-btn svg { width: 14px; height: 14px; }
.view-btn { background: rgba(14, 165, 233, 0.1); color: #38bdf8; border-color: rgba(14,165,233,.25); }
.view-btn:hover { background: rgba(14,165,233,.25); }
.edit-btn { background: rgba(99, 102, 241, 0.1); color: #a5b4fc; border-color: rgba(99,102,241,.25); }
.edit-btn:hover { background: rgba(99,102,241,.25); }
.del-btn  { background: rgba(244, 63, 94, 0.1);  color: #fb7185; border-color: rgba(244,63,94,.25); }
.del-btn:hover { background: rgba(244,63,94,.25); }

/* ── Pagination ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-top: 1.75rem;
}
.page-btn {
  padding: 0.45rem 1rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  color: #94a3b8;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) { border-color: #38bdf8; color: #38bdf8; }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-info { font-size: 0.875rem; color: #64748b; }

/* ── Modal overlay ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-box {
  background: #0f172a;
  border: 1px solid rgba(51, 65, 85, 0.7);
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  animation: modal-in 0.22s ease;
}
.modal-sm { max-width: 400px; }

@keyframes modal-in {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem 0;
}
.modal-title {
  font-size: 1.15rem; font-weight: 800; color: #f8fafc; margin: 0;
}
.modal-id { color: #38bdf8; margin-left: 0.4rem; }
.danger-title { color: #fb7185; }
.modal-close {
  background: transparent; border: none;
  color: #475569; cursor: pointer; font-size: 1.1rem;
  transition: color 0.2s;
}
.modal-close:hover { color: #f8fafc; }

.modal-body { padding: 1.25rem 1.5rem; }
.modal-hint { font-size: 0.85rem; color: #64748b; margin: 0 0 1rem; }

/* ── Form ── */
.form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.9rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; }
.form-input {
  padding: 0.6rem 0.85rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 10px;
  color: #f8fafc;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}
.form-input:focus { border-color: #38bdf8; }
.form-input::placeholder { color: #475569; }

.item-row {
  display: flex; gap: 0.75rem; align-items: flex-end;
  margin-bottom: 0.75rem;
}
.item-row .form-group { flex: 1; margin-bottom: 0; }

.remove-item-btn {
  width: 34px; height: 36px; flex-shrink: 0;
  background: rgba(244,63,94,.1); border: 1px solid rgba(244,63,94,.3);
  color: #fb7185; border-radius: 8px; cursor: pointer; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; margin-bottom: 0;
}
.remove-item-btn:hover { background: rgba(244,63,94,.25); }

.add-item-btn {
  background: transparent;
  border: 1px dashed rgba(14, 165, 233, 0.4);
  color: #38bdf8;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: center;
  margin-top: 0.25rem;
}
.add-item-btn:hover { background: rgba(14, 165, 233, 0.08); border-style: solid; }

/* ── Detail modal grid ── */
.detail-grid-modal { display: flex; flex-direction: column; gap: 0.75rem; }
.detail-row { display: flex; align-items: center; gap: 0.75rem; }
.detail-k {
  font-size: 0.78rem; font-weight: 700; color: #475569;
  text-transform: uppercase; letter-spacing: 0.05em;
  min-width: 90px;
}
.detail-v { font-size: 0.9rem; color: #e2e8f0; }
.price-v { color: #a3e635; font-weight: 700; font-size: 1rem; }

.items-section { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
.items-list { display: flex; flex-direction: column; gap: 0.5rem; }
.detail-item-card {
  display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51,65,85,0.4);
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
}
.di-label { font-size: 0.72rem; color: #475569; font-weight: 700; text-transform: uppercase; }
.di-val   { font-size: 0.88rem; color: #94a3b8; font-family: monospace; margin-right: 0.5rem; }

/* ── Modal loading ── */
.modal-loading {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.75rem; padding: 2rem 0; color: #64748b;
}

/* ── Modal footer ── */
.modal-footer {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(30, 41, 59, 0.8);
}
.footer-btn {
  padding: 0.55rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-family: inherit;
}
.footer-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cancel-btn {
  background: rgba(30,41,59,.8);
  border-color: rgba(71,85,105,.5);
  color: #94a3b8;
}
.cancel-btn:hover { border-color: #94a3b8; color: #f8fafc; }
.confirm-btn {
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
  color: #fff;
  box-shadow: 0 4px 12px rgba(14,165,233,.35);
}
.confirm-btn:hover:not(:disabled) { box-shadow: 0 6px 18px rgba(14,165,233,.5); }
.danger-btn {
  background: rgba(244,63,94,.15);
  border-color: rgba(244,63,94,.4);
  color: #fb7185;
}
.danger-btn:hover:not(:disabled) { background: rgba(244,63,94,.3); color: #fff; }

/* ── Spinner ── */
.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* ── Confirm msg ── */
.confirm-msg { font-size: 0.9rem; color: #94a3b8; line-height: 1.6; margin: 0; }
.confirm-msg strong { color: #f8fafc; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 640px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .orders-table th, .orders-table td { padding: 0.75rem 0.85rem; }
}
</style>
