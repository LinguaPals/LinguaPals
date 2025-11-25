import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import storage from "../lib/storage/mongoBlobStorage.js";
import { emit } from "../lib/events.js";
import { getDateId, getWeekTag } from "../utils/dateIds.js";

export const createVideoPost = async ({ userId, body }) => {
  const dateId = body.dateId || getDateId();
  const weekTag = body.weekTag || getWeekTag();
  const info = await storage.create();
  const post = new Post({
    title: body.title || "Video Post",
    description: body.description || "Video submission",
    userId,
    matchId: body.matchId || null,
    dateId,
    weekTag,
    storage: body.storage || info,
    media: body.media || { mime: "video/mp4", sizeBytes: 0, durationSec: 0, ratio: "16:9" },
    status: "ready",
    reported: false,
    expiresAt: body.expiresAt || null
  });
  await post.save();

  // Update streak: only increment once per day
  const user = await User.findById(userId);
  if (user && user.lastUploadDateId !== dateId) {
    user.streakCount = (user.streakCount || 0) + 1;
    user.lastUploadDateId = dateId;
    await user.save();
  }

  emit("VIDEO_UPLOADED", { userId, post });
  return post;
};

export default { createVideoPost };
