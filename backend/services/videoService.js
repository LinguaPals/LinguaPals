import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import storage from "../lib/storage/mongoBlobStorage.js";
import { emit } from "../lib/events.js";
import { getDateId, getWeekTag } from "../utils/dateIds.js";

export const createVideoPost = async ({ userId, body }) => {
  const dateId = body.dateId || getDateId();
  const weekTag = body.weekTag || getWeekTag();
  const info = await storage.create();
  
  // 🔒 FIX: Fetch user's actual currentMatchId from database
  // This ensures posts get the correct matchId, not client-controlled data
  const user = await User.findById(userId).select('currentMatchId').lean();
  
  // Fail-safe: If user not found, still allow post creation but with null matchId
  // This prevents complete failure and allows unmatched users to post
  const matchId = user?.currentMatchId || null;
  
  const post = new Post({
    title: body.title || "Video Post",
    description: body.description || "Video submission",
    userId,
    matchId,  // ✅ Server-controlled matchId from user's actual match
    dateId,
    weekTag,
    storage: body.storage || info,
    media: body.media || { mime: "video/mp4", sizeBytes: 0, durationSec: 0, ratio: "16:9" },
    status: "ready",
    reported: false,
    expiresAt: body.expiresAt || null
  });
  
  await post.save();
  emit("VIDEO_UPLOADED", { userId, post });
  return post;
};

export default { createVideoPost };