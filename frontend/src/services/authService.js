import api from '../utils/api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  searchUsers: async (query) => {
    const response = await api.get(`/auth/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/auth/all-users');
    return response.data;
  }
};



export default authService;
