// backend/src/middleware/upload.js - FIXED VERSION
import multer from "multer";

// ✅ FIXED: Use memory storage for ALL uploads
// Controllers handle Cloudinary upload with optimizations
const storage = multer.memoryStorage();

// ✅ File filter
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: JPG, PNG, GIF, WebP. Got: ${file.mimetype}`), false);
  }
};

// ✅ Unified upload configuration
const uploadConfig = {
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1
  },
  fileFilter: fileFilter
};

// ✅ Single multer instance
const upload = multer(uploadConfig);

// ✅ Named exports for different use cases
export const uploadSingle = upload.single('image');
export const uploadLogo = upload.single('logo');
export const uploadCover = upload.single('cover');
export const uploadGallery = upload.single('image'); // ✅ Now uses memory storage!

// Default export
export default upload;

// ✅ Error handler middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name. Use "image", "logo", or "cover".' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err && err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }

  next(err);
};