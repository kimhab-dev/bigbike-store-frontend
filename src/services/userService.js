import api from '@/api/axios';
import { API_ENDPOINTS } from '@/constants';

export const userService = {
  // GET /users?page=1&limit=10 (Get all users with pagination)
  getAllUsers(page = 1, limit = 10) {
    return api.get(API_ENDPOINTS.USERS.LIST, { params: { page, limit } });
  },
};

export default userService;
