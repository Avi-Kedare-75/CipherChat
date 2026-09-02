import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'voice', 'system'],
      default: 'text',
    },
    // Plaintext content (Phase 1-3) — will transition to encryptedContent in Phase 4
    content: {
      type: String,
      default: '',
    },
    // E2EE: Encrypted content (Phase 4)
    encryptedContent: {
      ciphertext: { type: Buffer },
      senderKeyVersion: { type: Number },
    },
    recipientCiphertexts: [
      {
        recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        ciphertext: { type: Buffer },
      },
    ],
    // File attachment metadata
    fileUrl: { type: String, default: '' },
    fileMetadata: {
      originalName: { type: String },
      size: { type: Number },
      mimeType: { type: String },
      thumbnailUrl: { type: String },
      encryptedKey: { type: String },
    },
    // Reply / threading
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    // Reactions
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String },
      },
    ],
    // Delivery status
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    deliveredTo: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    isForwarded: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient message queries (chatId + timestamp)
messageSchema.index({ chatId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
