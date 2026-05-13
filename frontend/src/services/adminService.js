import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const adminAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminService = {
  getUsers: async () => {
    const response = await adminAxios.get('/admin/users');
    return response.data;
  },
  getTransactions: async () => {
    const response = await adminAxios.get('/admin/transactions');
    return response.data;
  },
  getAccounts: async () => {
    const response = await adminAxios.get('/admin/accounts');
    return response.data;
  },
  getMetrics: async () => {
    const response = await adminAxios.get('/admin/metrics');
    return response.data;
  },
};
