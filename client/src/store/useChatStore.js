import { create } from 'zustand';
import { chatService } from '../services/chatService.js';
import { messageService } from '../services/messageService.js';

export const useChatStore = create((set, get) => ({
  // Active chat session
  activeChat: null,
  chats: [],
  messages: {},
  searchQuery: '',
  isSearchActive: false,
  isLoadingChats: false,
  isLoadingMessages: false,

  // Selected contact when initiating chat from search/new chat
  selectedContact: null,

  // Reply state
  replyingTo: null,

  // In-Chat Search
  chatSearchQuery: '',
  isChatSearching: false,

  // Modals
  isGroupInfoOpen: false,
  isCreateGroupOpen: false,

  setActiveChat: (chat) => {
    set({
      activeChat: chat,
      selectedContact: null,
      replyingTo: null,
      chatSearchQuery: '',
      isChatSearching: false,
    });
  },

  setSelectedContact: (contact) => {
    set({
      selectedContact: contact,
      activeChat: null,
      replyingTo: null,
    });
  },

  clearActiveSelection: () => {
    set({
      activeChat: null,
      selectedContact: null,
      replyingTo: null,
      chatSearchQuery: '',
    });
  },

  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),

  setChatSearchQuery: (query) => set({ chatSearchQuery: query }),
  setIsChatSearching: (isOpen) => set({ isChatSearching: isOpen, chatSearchQuery: isOpen ? get().chatSearchQuery : '' }),

  setIsGroupInfoOpen: (isOpen) => set({ isGroupInfoOpen: isOpen }),
  setIsCreateGroupOpen: (isOpen) => set({ isCreateGroupOpen: isOpen }),

  setChats: (chats) => set({ chats }),

  setSearchQuery: (query) => {
    set({
      searchQuery: query,
      isSearchActive: query.trim().length > 0,
    });
  },

  clearSearch: () => {
    set({ searchQuery: '', isSearchActive: false });
  },

  // API Actions
  fetchChats: async () => {
    set({ isLoadingChats: true });
    try {
      const data = await chatService.getUserChats();
      set({ chats: data.chats || [] });
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      set({ isLoadingChats: false });
    }
  },

  accessOrCreateChat: async (userId) => {
    try {
      const data = await chatService.accessChat(userId);
      const chat = data.chat;
      set((state) => {
        const exists = state.chats.some((c) => c._id === chat._id);
        const newChats = exists
          ? state.chats.map((c) => (c._id === chat._id ? chat : c))
          : [chat, ...state.chats];
        return {
          chats: newChats,
          activeChat: chat,
          selectedContact: null,
        };
      });
      return chat;
    } catch (error) {
      console.error('Failed to access or create chat:', error);
      throw error;
    }
  },

  createGroupChat: async ({ name, users, description }) => {
    try {
      const data = await chatService.createGroupChat({ name, users, description });
      const newGroup = data.chat;
      set((state) => ({
        chats: [newGroup, ...state.chats],
        activeChat: newGroup,
        isCreateGroupOpen: false,
      }));
      return newGroup;
    } catch (error) {
      console.error('Failed to create group:', error);
      throw error;
    }
  },

  renameGroup: async (chatId, groupName) => {
    try {
      const data = await chatService.renameGroup({ chatId, groupName });
      const updated = data.chat;
      set((state) => ({
        chats: state.chats.map((c) => (c._id === chatId ? updated : c)),
        activeChat: state.activeChat?._id === chatId ? updated : state.activeChat,
      }));
      return updated;
    } catch (error) {
      console.error('Failed to rename group:', error);
      throw error;
    }
  },

  addToGroup: async (chatId, userId) => {
    try {
      const data = await chatService.addToGroup({ chatId, userId });
      const updated = data.chat;
      set((state) => ({
        chats: state.chats.map((c) => (c._id === chatId ? updated : c)),
        activeChat: state.activeChat?._id === chatId ? updated : state.activeChat,
      }));
      return updated;
    } catch (error) {
      console.error('Failed to add user to group:', error);
      throw error;
    }
  },

  removeFromGroup: async (chatId, userId) => {
    try {
      const data = await chatService.removeFromGroup({ chatId, userId });
      const updated = data.chat;
      set((state) => ({
        chats: state.chats.map((c) => (c._id === chatId ? updated : c)),
        activeChat: state.activeChat?._id === chatId ? updated : state.activeChat,
      }));
      return updated;
    } catch (error) {
      console.error('Failed to remove user from group:', error);
      throw error;
    }
  },

  fetchMessages: async (chatId) => {
    set({ isLoadingMessages: true });
    try {
      const data = await messageService.getMessages(chatId);
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: data.messages || [],
        },
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (chatId, contentOrPayload) => {
    try {
      const payload =
        typeof contentOrPayload === 'string'
          ? { chatId, content: contentOrPayload }
          : { chatId, ...contentOrPayload };

      const data = await messageService.sendMessage(payload);
      const msg = data.message;

      // Update local state immediately
      set((state) => {
        const chatMessages = state.messages[chatId] || [];
        const updatedChats = state.chats
          .map((c) =>
            c._id === chatId
              ? { ...c, lastMessage: msg, updatedAt: new Date().toISOString() }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          );

        return {
          messages: {
            ...state.messages,
            [chatId]: [...chatMessages, msg],
          },
          chats: updatedChats,
          replyingTo: null,
        };
      });

      return msg;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  reactToMessage: async (messageId, emoji) => {
    try {
      const data = await messageService.reactToMessage(messageId, emoji);
      const updated = data.message;
      get().handleMessageReacted(updated);
      return updated;
    } catch (error) {
      console.error('Failed to react to message:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId, forEveryone = true) => {
    try {
      const data = await messageService.deleteMessage(messageId, forEveryone);
      const updated = data.message;
      get().handleMessageDeleted(updated);
      return updated;
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  },

  // Socket Handlers
  receiveMessage: (message) => {
    const { chatId } = message;
    const actualChatId = typeof chatId === 'object' ? chatId._id : chatId;

    set((state) => {
      const chatMessages = state.messages[actualChatId] || [];
      if (chatMessages.some((m) => m._id === message._id)) return state;

      const updatedChats = state.chats
        .map((c) =>
          c._id === actualChatId
            ? { ...c, lastMessage: message, updatedAt: new Date().toISOString() }
            : c
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt)
        );

      return {
        messages: {
          ...state.messages,
          [actualChatId]: [...chatMessages, message],
        },
        chats: updatedChats,
      };
    });
  },

  handleMessageReacted: (updatedMessage) => {
    const chatId = typeof updatedMessage.chatId === 'object' ? updatedMessage.chatId._id : updatedMessage.chatId;
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      return {
        messages: {
          ...state.messages,
          [chatId]: chatMessages.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
        },
      };
    });
  },

  handleMessageDeleted: (deletedMessage) => {
    const chatId = typeof deletedMessage.chatId === 'object' ? deletedMessage.chatId._id : deletedMessage.chatId;
    set((state) => {
      const chatMessages = state.messages[chatId] || [];
      return {
        messages: {
          ...state.messages,
          [chatId]: chatMessages.map((m) => (m._id === deletedMessage._id ? deletedMessage : m)),
        },
      };
    });
  },

  handleGroupUpdated: (updatedGroup) => {
    set((state) => ({
      chats: state.chats.map((c) => (c._id === updatedGroup._id ? updatedGroup : c)),
      activeChat: state.activeChat?._id === updatedGroup._id ? updatedGroup : state.activeChat,
    }));
  },
}));
