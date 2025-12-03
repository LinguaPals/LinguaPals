import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import * as storage from "../lib/storage/mongoBlobStorage.js";
import { emit } from "../lib/events.js";
import { getDateId, getWeekTag } from "../utils/dateIds.js";

export const createVideoPost = async ({ userId, body, file }) => {
  const dateId = body.dateId || getDateId();
  const weekTag = body.weekTag || getWeekTag();
  
  // 🔒 FIX: Fetch user's actual currentMatchId from database
  const user = await User.findById(userId).select('currentMatchId').lean();
  const matchId = user?.currentMatchId || null;
  
  let storageInfo = null;
  let postId = null;
  
  try {
    // Upload video to GridFS
    storageInfo = await storage.create({
      buffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
      metadata: {
        userId,
        matchId
      }
    });
    
    // Create Post document with real storage metadata
    const post = new Post({
      title: body.title || "Video Post",
      description: body.description || "Video submission",
      userId,
      matchId,
      dateId,
      weekTag,
      storage: storageInfo, // ✅ Real GridFS storageId and key
      media: {
        mime: file.mimetype,
        sizeBytes: file.size, // ✅ Real file size
        durationSec: 0,       // TODO: Extract duration with ffmpeg in future
        ratio: "16:9"
      },
      status: "ready",
      reported: false,
      expiresAt: body.expiresAt || null
    });
    
    await post.save();
    postId = post._id;
    
    emit("VIDEO_UPLOADED", { userId, post });
    return post;
    
  } catch (error) {
    console.error("Error in createVideoPost:", error);
    
    // Cleanup: If GridFS upload succeeded but Post save failed, delete the file
    if (storageInfo?.storageId && !postId) {
      try {
        await storage.remove(storageInfo.storageId);
      } catch (cleanupError) {
        console.error("Failed to cleanup orphaned file:", cleanupError);
      }
    }
    
    throw error;
  }
};

export default { createVideoPost };