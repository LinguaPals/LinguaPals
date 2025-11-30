import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { getDateId, getWeekTag } from "../utils/dateIds.js";

export const getStateForUser = async (userId) => {
  const dateId = getDateId();
  const weekTag = getWeekTag();
  const existing = await Post.findOne({ userId, dateId }).lean();
  const user = await User.findById(userId).select("currentMatchId").lean();
  let match = null;

  if (user?.currentMatchId) {
    const partner = await User.findOne({ currentMatchId: user.currentMatchId, _id: { $ne: userId } }).select("_id username").lean();
    match = {
      matchId: user.currentMatchId,
      partnerId: partner?._id || null,
      partnerUsername: partner?.username || null
    };
  }
  const canUpload = !existing;
  return { canUpload, dateId, weekTag, match };
};

export default { getStateForUser };
