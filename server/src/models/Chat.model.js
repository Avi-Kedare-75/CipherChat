import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: ['private', 'group'],
      default: 'private',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    // Group-specific fields
    groupName: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    groupAvatar: {
      type: String,
      default: '',
    },
    groupDescription: {
      type: String,
      maxlength: 500,
      default: '',
    },
    groupAdmin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Per-user settings stored as Maps: { <userId>: <value> }
    isArchived: {
      type: Map,
      of: Boolean,
      default: {},
    },
    isMuted: {
      type: Map,
      of: Date, // Muted until this date
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient chat lookups
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
