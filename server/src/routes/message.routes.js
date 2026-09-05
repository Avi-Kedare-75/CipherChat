import express from 'express';
import {
  sendMessage,
  getMessages,
  uploadFile,
  reactToMessage,
  deleteMessage,
} from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/upload').post(protect, upload.single('file'), uploadFile);
router.route('/:chatId').get(protect, getMessages);
router.route('/:messageId/react').put(protect, reactToMessage);
router.route('/:messageId').delete(protect, deleteMessage);

export default router;
