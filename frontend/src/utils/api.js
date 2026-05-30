import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { mockAuthAPI, mockLegacyAdminAPI, mockMandateAPI, mockRazorpayAPI } from './mockBackend';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('recurpay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // If the payload is FormData (file upload), let the browser set the Content-Type with the boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('recurpay_token');
      localStorage.removeItem('recurpay_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => (DEMO_MODE ? mockAuthAPI.register(data) : api.post('/api/auth/register', data)),
  login: (data) => (DEMO_MODE ? mockAuthAPI.login(data) : api.post('/api/auth/login', data)),
  getProfile: () => (DEMO_MODE ? mockAuthAPI.getProfile() : api.get('/api/auth/profile')),
  updateBankDetails: (data) => (DEMO_MODE ? mockAuthAPI.updateBankDetails(data) : api.put('/api/auth/bank-details', data)),
  getBankDetails: () => (DEMO_MODE ? mockAuthAPI.getBankDetails() : api.get('/api/auth/bank-details')),
  updateRazorpayAccount: (data) => (DEMO_MODE ? mockAuthAPI.updateRazorpayAccount(data) : api.put('/api/auth/razorpay-account', data)),
  getRazorpayAccount: () => (DEMO_MODE ? mockAuthAPI.getRazorpayAccount() : api.get('/api/auth/razorpay-account')),
};

// Admin APIs
export const adminAPI = {
  getPending: () => (DEMO_MODE ? mockLegacyAdminAPI.getPending() : api.get('/api/admin/pending-verifications')),
  verifyBank: (id) => (DEMO_MODE ? mockLegacyAdminAPI.verifyBank(id) : api.put(`/api/admin/verify-bank/${id}`)),
};

// Mandate APIs
export const mandateAPI = {
  create: (data) => (DEMO_MODE ? mockMandateAPI.create(data) : api.post('/api/mandates', data)),
  getAll: () => (DEMO_MODE ? mockMandateAPI.getAll() : api.get('/api/mandates')),
  getById: (id) => (DEMO_MODE ? mockMandateAPI.getById(id) : api.get(`/api/mandates/${id}`)),
  updateStatus: (id, status) => (DEMO_MODE ? mockMandateAPI.updateStatus(id, status) : api.put(`/api/mandates/${id}`, { status })),
};

// Razorpay APIs
export const razorpayAPI = {
  initiate: (data) => (DEMO_MODE ? mockRazorpayAPI.initiate(data) : api.post('/api/razorpay/initiate', data)),
  getLink: (id) => (DEMO_MODE ? mockRazorpayAPI.getLink(id) : api.get(`/api/razorpay/payment-link/${id}`)),
  syncStatus: (id) => (DEMO_MODE ? mockRazorpayAPI.syncStatus(id) : api.post(`/api/razorpay/payment-link/${id}/sync`)),
};

export default api;
