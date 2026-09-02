import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Public routes (with stricter rate limiting)
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', refreshAccessToken);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

export default router;
