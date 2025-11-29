import multer from "multer";

// Use memory storage - files are stored as Buffer in req.file.buffer
const storage = multer.memoryStorage();

// File filter - only accept video files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  }
});

// Export middleware for single video upload
export const uploadSingleVideo = upload.single("video");

export default uploadSingleVideo;