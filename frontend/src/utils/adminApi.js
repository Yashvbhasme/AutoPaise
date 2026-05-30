import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { mockAdminAPI } from './mockBackend';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const adminAxios = axios.create({
  baseURL: API_BASE_URL,
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('recurpay_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminAxios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('recurpay_admin_token');
      localStorage.removeItem('recurpay_admin');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (data) => (DEMO_MODE ? mockAdminAPI.login(data) : adminAxios.post('/api/admin/login', data)),
  getStats: () => (DEMO_MODE ? mockAdminAPI.getStats() : adminAxios.get('/api/admin/stats')),
  getAllOwners: (status) => (DEMO_MODE ? mockAdminAPI.getAllOwners(status) : adminAxios.get('/api/admin/owners' + (status ? '?status=' + status : ''))),
  getOwnerById: (id) => (DEMO_MODE ? mockAdminAPI.getOwnerById(id) : adminAxios.get('/api/admin/owners/' + id)),
  verifyOwner: (id) => (DEMO_MODE ? mockAdminAPI.verifyOwner(id) : adminAxios.put('/api/admin/owners/' + id + '/verify')),
  rejectOwner: (id, reason) => (DEMO_MODE ? mockAdminAPI.rejectOwner(id, reason) : adminAxios.put('/api/admin/owners/' + id + '/reject', { reason })),
  toggleOwnerStatus: (id, reason) => (DEMO_MODE ? mockAdminAPI.toggleOwnerStatus(id, reason) : adminAxios.put('/api/admin/owners/' + id + '/toggle-status', { reason })),
  getAllMandates: () => (DEMO_MODE ? mockAdminAPI.getAllMandates() : adminAxios.get('/api/admin/mandates')),
};
