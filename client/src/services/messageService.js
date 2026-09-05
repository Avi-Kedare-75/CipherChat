import api from './api.js';

export const messageService = {
  sendMessage: async ({ chatId, content, messageType, fileUrl, fileMetadata, replyTo }) => {
    const response = await api.post('/messages', {
      chatId,
      content,
      messageType,
      fileUrl,
      fileMetadata,
      replyTo,
    });
    return response.data;
  },

  getMessages: async (chatId) => {
    const response = await api.get(`/messages/${chatId}`);
    return response.data;
  },

  uploadFile: async (formData) => {
    const response = await api.post('/messages/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  reactToMessage: async (messageId, emoji) => {
    const response = await api.put(`/messages/${messageId}/react`, { emoji });
    return response.data;
  },

  deleteMessage: async (messageId, forEveryone = true) => {
    const response = await api.delete(`/messages/${messageId}?forEveryone=${forEveryone}`);
    return response.data;
  },
};
