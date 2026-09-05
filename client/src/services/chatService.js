import api from './api.js';

export const chatService = {
  accessChat: async (userId) => {
    const response = await api.post('/chats', { userId });
    return response.data;
  },

  getUserChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },

  createGroupChat: async ({ name, users, description }) => {
    const response = await api.post('/chats/group', { name, users, description });
    return response.data;
  },

  renameGroup: async ({ chatId, groupName }) => {
    const response = await api.put('/chats/group/rename', { chatId, groupName });
    return response.data;
  },

  addToGroup: async ({ chatId, userId }) => {
    const response = await api.put('/chats/group/add', { chatId, userId });
    return response.data;
  },

  removeFromGroup: async ({ chatId, userId }) => {
    const response = await api.put('/chats/group/remove', { chatId, userId });
    return response.data;
  },
};
