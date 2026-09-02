import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  searchUsers,
  toggleBlockUser,
} from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { updateProfileSchema } from '../utils/validators.js';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/avatar', updateAvatar);
router.get('/search', searchUsers);
router.put('/block/:userId', toggleBlockUser);

export default router;
