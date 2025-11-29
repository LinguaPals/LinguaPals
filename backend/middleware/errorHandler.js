export const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.message === "Only video files are allowed") {
      return res.status(400).json({
        success: false,
        message: "Only video files are allowed"
      });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 100MB"
      });
    }
    return res.status(500).json({
      success: false,
      message: "File upload error"
    });
  }
  next();
};
