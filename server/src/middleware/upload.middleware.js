import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import { MAX_FILE_SIZE } from '../utils/constants.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Allow all common file types
    const allowedMimes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      // Videos
      'video/mp4', 'video/webm', 'video/quicktime',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'File type not allowed', 'FILE_TYPE_NOT_ALLOWED'), false);
    }
  },
});

export default upload;
