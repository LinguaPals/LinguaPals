import Post from "../models/postModel.js";
import { getDateId, getWeekTag } from "../utils/dateIds.js";

export const getStateForUser = async (userId) => {
  const dateId = getDateId();
  const weekTag = getWeekTag();
  const existing = await Post.findOne({ userId, dateId }).lean();
  const canUpload = !existing;
  return { canUpload, dateId, weekTag, match: null };
};

export default { getStateForUser };
