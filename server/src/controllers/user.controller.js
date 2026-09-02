import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const response = ApiResponse.success('Profile fetched', { user: req.user });
  res.status(response.statusCode).json(response);
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, about } = req.body;

  const updateData = {};
  if (fullName !== undefined) updateData.fullName = fullName;
  if (about !== undefined) updateData.about = about;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  const response = ApiResponse.success('Profile updated', { user });
  res.status(response.statusCode).json(response);
});

/**
 * @route   PUT /api/users/avatar
 * @desc    Update user avatar (placeholder — full upload in Phase 3)
 */
export const updateAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;

  if (!avatar) {
    throw ApiError.badRequest('Avatar URL is required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true }
  );

  const response = ApiResponse.success('Avatar updated', { user });
  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/users/search?q=query
 * @desc    Search users by username, email, or full name
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    throw ApiError.badRequest('Search query is required');
  }

  const searchRegex = new RegExp(q.trim(), 'i');

  const users = await User.find({
    _id: { $ne: req.user._id }, // Exclude current user
    $or: [
      { username: searchRegex },
      { email: searchRegex },
      { fullName: searchRegex },
    ],
  })
    .select('username fullName email avatar about isOnline lastSeen')
    .limit(20);

  const response = ApiResponse.success('Users found', { users });
  res.status(response.statusCode).json(response);
});

/**
 * @route   PUT /api/users/block/:userId
 * @desc    Block or unblock a user
 */
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot block yourself');
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw ApiError.notFound('User not found');
  }

  const isBlocked = req.user.blockedUsers.includes(userId);

  if (isBlocked) {
    // Unblock
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { blockedUsers: userId },
    });
  } else {
    // Block
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: userId },
    });
  }

  const response = ApiResponse.success(
    isBlocked ? 'User unblocked' : 'User blocked'
  );
  res.status(response.statusCode).json(response);
});
