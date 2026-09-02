import { create } from 'zustand';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('cipherchat_user') || 'null'),
  accessToken: localStorage.getItem('cipherchat_access_token') || null,
  isAuthenticated: !!localStorage.getItem('cipherchat_access_token'),
  isLoading: false,
  isInitializing: true,
  error: null,

  // Initialize auth on page load/refresh
  initializeAuth: async () => {
    const token = localStorage.getItem('cipherchat_access_token');
    if (!token) {
      set({ isInitializing: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      set({ isInitializing: true });
      const response = await authService.getMe();
      if (response?.data?.user) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isInitializing: false,
        });
        localStorage.setItem('cipherchat_user', JSON.stringify(response.data.user));
      }
    } catch (err) {
      console.warn('Auth initialization session expired or invalid');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitializing: false,
      });
      localStorage.removeItem('cipherchat_access_token');
      localStorage.removeItem('cipherchat_user');
    }
  },

  // Login
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const { user, accessToken } = response.data;

      localStorage.setItem('cipherchat_access_token', accessToken);
      localStorage.setItem('cipherchat_user', JSON.stringify(user));

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Register
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      const { user, accessToken } = response.data;

      localStorage.setItem('cipherchat_access_token', accessToken);
      localStorage.setItem('cipherchat_user', JSON.stringify(user));

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Update profile
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.updateProfile(profileData);
      const updatedUser = response.data.user;

      localStorage.setItem('cipherchat_user', JSON.stringify(updatedUser));
      set({
        user: updatedUser,
        isLoading: false,
      });

      return { success: true, user: updatedUser };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Continue cleanup regardless
    } finally {
      localStorage.removeItem('cipherchat_access_token');
      localStorage.removeItem('cipherchat_user');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

// Listen for global auth expired events
if (typeof window !== 'undefined') {
  window.addEventListener('cipherchat_auth_expired', () => {
    useAuthStore.getState().logout();
  });
}
