import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  async updateAvatar(avatarUrl) {
    const response = await api.put('/users/avatar', { avatar: avatarUrl });
    return response.data;
  },

  async searchUsers(query) {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async toggleBlockUser(userId) {
    const response = await api.put(`/users/block/${userId}`);
    return response.data;
  },
};
