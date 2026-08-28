import api from '@/api/axios';
import { API_ENDPOINTS } from '@/constants';

export const orderService = {
  // GET /orders/my?page=1&limit=10  (Current user's orders)
  getMyOrders(params = {}) {
    return api.get(API_ENDPOINTS.ORDERS.MY, { params });
  },

  // GET /orders (Get all orders — admin)
  getAllOrders(params = {}) {
    return api.get(API_ENDPOINTS.ORDERS.LIST, { params });
  },

  // POST /orders  { items: [{ productId, quantity }] }
  createOrder(payload) {
    return api.post(API_ENDPOINTS.ORDERS.LIST, payload);
  },

  // GET /orders/:orderId
  getOrderById(orderId) {
    return api.get(API_ENDPOINTS.ORDERS.DETAIL(orderId));
  },

  // PATCH /orders/:orderId  { productId, total }
  patchOrder(orderId, payload) {
    return api.patch(API_ENDPOINTS.ORDERS.DETAIL(orderId), payload);
  },

  // DELETE /orders/:orderId
  deleteOrder(orderId) {
    return api.delete(API_ENDPOINTS.ORDERS.DETAIL(orderId));
  },
};

export default orderService;

