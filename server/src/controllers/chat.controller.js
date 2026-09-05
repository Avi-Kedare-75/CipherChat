import Chat from '../models/Chat.model.js';
import User from '../models/User.model.js';
import Message from '../models/Message.model.js';

/**
 * @desc    Access or create a 1-on-1 chat
 * @route   POST /api/chats
 * @access  Private
 */
export const accessChat = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId param not sent with request' });
    }

    let isChat = await Chat.find({
      chatType: 'private',
      $and: [
        { participants: { $elemMatch: { $eq: req.user._id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('participants', '-password')
      .populate('lastMessage');

    isChat = await User.populate(isChat, {
      path: 'lastMessage.sender',
      select: 'fullName email profilePic',
    });

    if (isChat.length > 0) {
      return res.status(200).json({ success: true, chat: isChat[0] });
    } else {
      const chatData = {
        chatType: 'private',
        participants: [req.user._id, userId],
        createdBy: req.user._id,
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'participants',
        '-password'
      );
      
      return res.status(201).json({ success: true, chat: fullChat });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch all chats for a user
 * @route   GET /api/chats
 * @access  Private
 */
export const getUserChats = async (req, res, next) => {
  try {
    let results = await Chat.find({ participants: { $elemMatch: { $eq: req.user._id } } })
      .populate('participants', '-password')
      .populate('lastMessage')
      .populate('groupAdmin', '-password')
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: 'lastMessage.sender',
      select: 'fullName email profilePic',
    });

    res.status(200).json({ success: true, chats: results });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new group chat
 * @route   POST /api/chats/group
 * @access  Private
 */
export const createGroupChat = async (req, res, next) => {
  try {
    let { name, users, description } = req.body;

    if (!name || !users) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (typeof users === 'string') {
      users = JSON.parse(users);
    }

    if (users.length < 1) {
      return res.status(400).json({ success: false, message: 'More than 2 users are required to form a group chat' });
    }

    const participants = [...new Set([...users, req.user._id.toString()])];

    const groupChat = await Chat.create({
      chatType: 'group',
      groupName: name,
      groupDescription: description || '',
      participants: participants,
      groupAdmin: [req.user._id],
      createdBy: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json({ success: true, chat: fullGroupChat });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rename group
 * @route   PUT /api/chats/group/rename
 * @access  Private
 */
export const renameGroup = async (req, res, next) => {
  try {
    const { chatId, groupName } = req.body;

    if (!chatId || !groupName) {
      return res.status(400).json({ success: false, message: 'ChatId and groupName required' });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupName },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.status(200).json({ success: true, chat: updatedChat });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add user to group
 * @route   PUT /api/chats/group/add
 * @access  Private
 */
export const addToGroup = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { participants: userId } },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    if (!added) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.status(200).json({ success: true, chat: added });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove user from group
 * @route   PUT /api/chats/group/remove
 * @access  Private
 */
export const removeFromGroup = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: {
          participants: userId,
          groupAdmin: userId,
        },
      },
      { new: true }
    )
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    if (!removed) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    res.status(200).json({ success: true, chat: removed });
  } catch (error) {
    next(error);
  }
};
