import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout request warning:', e.message);
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
