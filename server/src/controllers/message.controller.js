import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import Chat from '../models/Chat.model.js';

/**
 * @desc    Send a new message (text, media, voice, reply)
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res, next) => {
  const { content, chatId, messageType, fileUrl, fileMetadata, replyTo } = req.body;

  if ((!content && !fileUrl) || !chatId) {
    return res.status(400).json({ success: false, message: 'Invalid message payload' });
  }

  const newMessage = {
    sender: req.user._id,
    content: content || '',
    chatId: chatId,
    messageType: messageType || 'text',
    fileUrl: fileUrl || '',
    fileMetadata: fileMetadata || {},
    replyTo: replyTo || null,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate('sender', 'fullName profilePic email');
    message = await message.populate('chatId');
    if (replyTo) {
      message = await message.populate({
        path: 'replyTo',
        select: 'content messageType sender fileUrl',
        populate: { path: 'sender', select: 'fullName profilePic' },
      });
    }

    message = await User.populate(message, {
      path: 'chatId.participants',
      select: 'fullName profilePic email',
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload file attachment or voice note (up to 50MB)
 * @route   POST /api/messages/upload
 * @access  Private
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // Generate accessible relative URL
    const fileUrl = `/uploads/${req.file.filename}`;

    const fileMetadata = {
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    };

    res.status(200).json({
      success: true,
      fileUrl,
      fileMetadata,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    React to a message with emoji
 * @route   PUT /api/messages/:messageId/react
 * @access  Private
 */
export const reactToMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ success: false, message: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        // Toggle off if same emoji clicked
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Update emoji
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      // Add new reaction
      message.reactions.push({
        userId: req.user._id,
        emoji,
      });
    }

    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'fullName profilePic email')
      .populate('chatId')
      .populate({
        path: 'replyTo',
        select: 'content messageType sender fileUrl',
        populate: { path: 'sender', select: 'fullName profilePic' },
      });

    res.status(200).json({ success: true, message: updatedMessage });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete message (for everyone or for me)
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { forEveryone } = req.query;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (forEveryone === 'true') {
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Only sender can delete for everyone' });
      }

      message.isDeleted = true;
      message.content = '🚫 This message was deleted';
      message.fileUrl = '';
      await message.save();
    } else {
      // Delete for me
      if (!message.deletedFor.includes(req.user._id)) {
        message.deletedFor.push(req.user._id);
        await message.save();
      }
    }

    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'fullName profilePic email')
      .populate('chatId');

    res.status(200).json({ success: true, message: updatedMessage });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all messages for a chat
 * @route   GET /api/messages/:chatId
 * @access  Private
 */
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId,
      deletedFor: { $ne: req.user._id },
    })
      .populate('sender', 'fullName profilePic email')
      .populate('chatId')
      .populate({
        path: 'replyTo',
        select: 'content messageType sender fileUrl',
        populate: { path: 'sender', select: 'fullName profilePic' },
      })
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
