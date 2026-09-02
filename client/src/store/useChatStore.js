import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  // Active chat session
  activeChat: null,
  chats: [],
  messages: {},
  searchQuery: '',
  isSearchActive: false,
  isLoadingChats: false,

  // Selected contact when initiating chat from search/new chat
  selectedContact: null,

  setActiveChat: (chat) => {
    set({ activeChat: chat, selectedContact: null });
  },

  setSelectedContact: (contact) => {
    set({ selectedContact: contact, activeChat: null });
  },

  clearActiveSelection: () => {
    set({ activeChat: null, selectedContact: null });
  },

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
}));
