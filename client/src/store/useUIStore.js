import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Active modal or panel
  isProfileDrawerOpen: false,
  isNewChatModalOpen: false,
  isSettingsOpen: false,

  // Mobile navigation: true = show active chat, false = show chat list sidebar
  showMobileChat: false,

  // Theme
  isDarkMode: true,

  // Actions
  toggleProfileDrawer: () =>
    set((state) => ({ isProfileDrawerOpen: !state.isProfileDrawerOpen })),
  setProfileDrawerOpen: (open) => set({ isProfileDrawerOpen: open }),

  toggleNewChatModal: () =>
    set((state) => ({ isNewChatModalOpen: !state.isNewChatModalOpen })),
  setNewChatModalOpen: (open) => set({ isNewChatModalOpen: open }),

  setShowMobileChat: (show) => set({ showMobileChat: show }),

  toggleTheme: () => {
    set((state) => {
      const nextTheme = !state.isDarkMode;
      if (nextTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDarkMode: nextTheme };
    });
  },
}));
