import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket = null;

/**
 * Lazy-initialize GridFS bucket
 * Uses mongoose connection's underlying MongoDB driver
 */
const getBucket = () => {
  if (!bucket) {
    if (!mongoose.connection.db) {
      throw new Error("MongoDB connection not established. Cannot initialize GridFS bucket.");
    }
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "videos"
    });
  }
  return bucket;
};

/**
 * Upload video buffer to GridFS
 * @param {Object} options
 * @param {Buffer} options.buffer - Video file buffer
 * @param {String} options.filename - Original filename
 * @param {String} options.mimetype - MIME type (e.g., "video/mp4")
 * @param {Object} options.metadata - Additional metadata (userId, matchId, postId)
 * @returns {Promise<{provider: string, storageId: string, key: string}>}
 */
export const create = async ({ buffer, filename, mimetype, metadata = {} }) => {
  try {
    const gridBucket = getBucket();
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}_${filename}`;
    
    return new Promise((resolve, reject) => {
      const uploadStream = gridBucket.openUploadStream(uniqueFilename, {
        contentType: mimetype,
        metadata: {
          ...metadata,
          uploadedAt: new Date()
        }
      });

      uploadStream.on("error", (error) => {
        console.error("GridFS upload error:", error);
        reject(error);
      });

      uploadStream.on("finish", () => {
        resolve({
          provider: "mongo",
          storageId: uploadStream.id.toString(), // GridFS file _id
          key: uniqueFilename                     // GridFS filename
        });
      });

      // Write buffer to GridFS
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Failed to create GridFS upload stream:", error);
    throw error;
  }
};

/**
 * Get a read stream from GridFS for video playback
 * @param {String} storageId - GridFS file _id
 * @returns {ReadStream}
 */
export const getReadStream = (storageId) => {
  try {
    const gridBucket = getBucket();
    const objectId = new mongoose.Types.ObjectId(storageId);
    return gridBucket.openDownloadStream(objectId);
  } catch (error) {
    console.error("Failed to create GridFS read stream:", error);
    throw error;
  }
};

/**
 * Delete a video file from GridFS
 * @param {String} storageId - GridFS file _id
 * @returns {Promise<void>}
 */
export const remove = async (storageId) => {
  try {
    const gridBucket = getBucket();
    const objectId = new mongoose.Types.ObjectId(storageId);
    await gridBucket.delete(objectId);
    console.log(`GridFS file deleted: ${storageId}`);
  } catch (error) {
    // Log but don't throw - best-effort cleanup
    console.error(`Failed to delete GridFS file ${storageId}:`, error);
  }
};

export default { create, getReadStream, remove };