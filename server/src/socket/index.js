import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.user.fullName} (${socket.userId})`);

    // Join user's personal room (for direct notifications)
    socket.join(socket.userId);

    // Update user's online status
    User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date(),
    }).exec();

    // Broadcast online status
    socket.broadcast.emit('user:status', {
      userId: socket.userId,
      isOnline: true,
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.user.fullName}`);

      User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      }).exec();

      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date(),
      });
    });

    // Chat room joining
    socket.on('join chat', (room) => {
      socket.join(room);
      console.log(`User Joined Room: ${room}`);
    });

    // Typing indicators
    socket.on('typing', (room) => socket.in(room).emit('typing', room));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing', room));

    // New message broadcast
    socket.on('new message', (newMessageReceived) => {
      const chat = newMessageReceived.chatId;
      if (!chat || !chat.participants) return;

      chat.participants.forEach((user) => {
        const participantId = user._id ? user._id.toString() : user.toString();
        if (participantId === socket.userId) return;

        socket.in(participantId).emit('message received', newMessageReceived);
      });
    });

    // Message reaction broadcast
    socket.on('message reaction', (updatedMessage) => {
      const chat = updatedMessage.chatId;
      if (!chat || !chat.participants) return;

      chat.participants.forEach((user) => {
        const participantId = user._id ? user._id.toString() : user.toString();
        socket.in(participantId).emit('message reacted', updatedMessage);
      });
    });

    // Message delete broadcast
    socket.on('message deleted', (deletedMessage) => {
      const chat = deletedMessage.chatId;
      if (!chat || !chat.participants) return;

      chat.participants.forEach((user) => {
        const participantId = user._id ? user._id.toString() : user.toString();
        socket.in(participantId).emit('message deleted', deletedMessage);
      });
    });

    // Group updated broadcast
    socket.on('group updated', (updatedGroup) => {
      if (!updatedGroup || !updatedGroup.participants) return;

      updatedGroup.participants.forEach((user) => {
        const participantId = user._id ? user._id.toString() : user.toString();
        socket.in(participantId).emit('group updated', updatedGroup);
      });
    });

    // Message read receipts
    socket.on('message read', ({ messageId, chatId, senderId }) => {
      socket.in(senderId).emit('message read', { messageId, chatId });
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
