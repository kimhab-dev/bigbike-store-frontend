import api from '@/api/axios';
import { API_ENDPOINTS } from '@/constants';

export const productService = {
  // GET /products (Get all products)
  getAllProducts() {
    return api.get(API_ENDPOINTS.PRODUCTS.LIST);
  },

  // GET /products/:productId (Get product by ID)
  getProductById(productId) {
    return api.get(API_ENDPOINTS.PRODUCTS.DETAIL(productId));
  },

  // GET /products/my (Get own products)
  getMyProducts() {
    return api.get(API_ENDPOINTS.PRODUCTS.MY);
  },

  // POST /products (Create new product: { name, price, description, category_id, stock, year, engince, color })
  createProduct(productData) {
    return api.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
  },

  // POST /products/:productId/image (Upload product image FormData - field name: 'image')
  uploadProductImage(productId, fileOrFormData, fieldName = 'image') {
    let formData = fileOrFormData;
    if (fileOrFormData instanceof File) {
      formData = new FormData();
      formData.append(fieldName, fileOrFormData);
    }
    return api.post(API_ENDPOINTS.PRODUCTS.IMAGE(productId), formData);
  },

  // PATCH /products/:productId (Update product: { name, price, description, category_id, stock, year, engince, color })
  updateProduct(productId, productData) {
    return api.patch(API_ENDPOINTS.PRODUCTS.DETAIL(productId), productData);
  },

  // PATCH /products/:productId/stock (Update stock: { stock })
  updateProductStock(productId, stockValue) {
    const payload = typeof stockValue === 'object' ? stockValue : { stock: Number(stockValue) };
    return api.patch(API_ENDPOINTS.PRODUCTS.STOCK(productId), payload);
  },

  // Alias for updateProductStock
  updateStock(productId, stockValue) {
    return this.updateProductStock(productId, stockValue);
  },

  // DELETE /products/:productId (Delete product)
  deleteProduct(productId) {
    return api.delete(API_ENDPOINTS.PRODUCTS.DETAIL(productId));
  },
};

export default productService;
