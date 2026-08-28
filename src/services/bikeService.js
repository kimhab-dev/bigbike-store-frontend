import api from '@/api/axios';
import { API_ENDPOINTS } from '@/constants';

export const bikeService = {
  getAll(params = {}) {
    return api.get(API_ENDPOINTS.BIKES.LIST, { params });
  },

  getById(id) {
    return api.get(API_ENDPOINTS.BIKES.DETAIL(id));
  },

  create(data) {
    return api.post(API_ENDPOINTS.BIKES.LIST, data);
  },

  update(id, data) {
    return api.put(API_ENDPOINTS.BIKES.DETAIL(id), data);
  },

  delete(id) {
    return api.delete(API_ENDPOINTS.BIKES.DETAIL(id));
  },
};

export default bikeService;
