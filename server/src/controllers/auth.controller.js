import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateTokens, verifyRefreshToken } from '../services/auth.service.js';
import { JWT_COOKIE_OPTIONS } from '../utils/constants.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Username';
    throw ApiError.conflict(`${field} already exists`, 'USER_EXISTS');
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    fullName,
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, JWT_COOKIE_OPTIONS);

  const response = ApiResponse.created('User registered successfully', {
    user: user.toJSON(),
    accessToken,
  });

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field included
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, JWT_COOKIE_OPTIONS);

  const response = ApiResponse.success('Login successful', {
    user: user.toJSON(),
    accessToken,
  });

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw ApiError.unauthorized('Refresh token is required', 'TOKEN_INVALID');
  }

  try {
    const decoded = verifyRefreshToken(incomingRefreshToken);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user) {
      throw ApiError.unauthorized('Invalid refresh token', 'TOKEN_INVALID');
    }

    // Verify token matches stored token (prevents reuse of old tokens)
    if (user.refreshToken !== incomingRefreshToken) {
      throw ApiError.unauthorized('Refresh token expired or used', 'TOKEN_EXPIRED');
    }

    // Generate new token pair (token rotation)
    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, JWT_COOKIE_OPTIONS);

    const response = ApiResponse.success('Token refreshed', { accessToken });
    res.status(response.statusCode).json(response);
  } catch (error) {
    throw ApiError.unauthorized('Invalid refresh token', 'TOKEN_INVALID');
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & invalidate refresh token
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from DB
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  // Clear cookie
  res.clearCookie('refreshToken', JWT_COOKIE_OPTIONS);

  const response = ApiResponse.success('Logged out successfully');
  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 */
export const getMe = asyncHandler(async (req, res) => {
  const response = ApiResponse.success('User fetched', { user: req.user });
  res.status(response.statusCode).json(response);
});
