import api from '@/api/axios';
import { API_ENDPOINTS } from '@/constants';

export const categoryService = {
  // GET /categories (Admin only)
  getAllCategories() {
    return api.get(API_ENDPOINTS.CATEGORIES.LIST);
  },

  // POST /categories (Admin only: { name, description })
  createCategory(categoryData) {
    return api.post(API_ENDPOINTS.CATEGORIES.LIST, categoryData);
  },

  // DELETE /categories/:id (Admin only)
  deleteCategory(categoryId) {
    return api.delete(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId));
  },
};

export default categoryService;
