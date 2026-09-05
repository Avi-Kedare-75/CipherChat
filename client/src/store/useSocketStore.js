import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useChatStore } from './useChatStore';
import {
  requestNotificationPermission,
  sendDesktopNotification,
} from '../utils/notifications';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000');

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),

  connect: (token) => {
    if (get().socket?.connected) return;

    // Request notification permission once connected
    requestNotificationPermission();

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      set({ isConnected: true, socket });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false, socket: null });
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
    });

    // Handle incoming user status
    socket.on('user:status', ({ userId, isOnline }) => {
      const { onlineUsers } = get();
      const newOnlineUsers = new Set(onlineUsers);

      if (isOnline) {
        newOnlineUsers.add(userId);
      } else {
        newOnlineUsers.delete(userId);
      }

      set({ onlineUsers: newOnlineUsers });
    });

    // Handle incoming messages globally
    socket.on('message received', (newMessage) => {
      useChatStore.getState().receiveMessage(newMessage);

      // Desktop notification when message arrives
      const senderName = newMessage.sender?.fullName || 'CipherChat';
      const textPreview =
        newMessage.messageType === 'text'
          ? newMessage.content?.startsWith('enc:')
            ? '🔐 Encrypted Message'
            : newMessage.content
          : `📎 Shared ${newMessage.messageType}`;

      sendDesktopNotification(`💬 ${senderName}`, textPreview);
    });

    // Handle message reactions globally
    socket.on('message reacted', (updatedMessage) => {
      useChatStore.getState().handleMessageReacted(updatedMessage);
    });

    // Handle message deletions globally
    socket.on('message deleted', (deletedMessage) => {
      useChatStore.getState().handleMessageDeleted(deletedMessage);
    });

    // Handle group updates globally
    socket.on('group updated', (updatedGroup) => {
      useChatStore.getState().handleGroupUpdated(updatedGroup);
    });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, onlineUsers: new Set() });
    }
  },
}));
