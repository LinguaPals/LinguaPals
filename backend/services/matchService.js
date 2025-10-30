import Match from "../models/matchModel.js";
import User from "../models/userModel.js";
import { getWeekTag } from "../utils/dateIds.js";

const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const generateAndPublish = async (weekTag = getWeekTag()) => {
  const users = await User.find({ language: { $exists: true, $ne: null } }, "_id language").lean();
  const groups = new Map();
  for (const u of users) {
    const k = String(u.language || "").trim().toLowerCase();
    if (!k) continue;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(u._id);
  }
  const pairs = [];
  for (const [, ids] of groups) {
    shuffle(ids);
    for (let i = 0; i + 1 < ids.length; i += 2) pairs.push([ids[i], ids[i + 1]]);
  }
  await Match.deleteMany({ weekTag });
  const docs = pairs.map(p => ({ weekTag, userA: p[0], userB: p[1] }));
  if (docs.length) await Match.insertMany(docs);
  return docs;
};

export const getMatchForUser = async (userId, weekTag = getWeekTag()) => {
  const match = await Match.findOne({ weekTag, $or: [{ userA: userId }, { userB: userId }] }).lean();
  if (!match) return null;
  const partnerId = String(match.userA) === String(userId) ? match.userB : match.userA;
  return { matchId: match._id, partnerId };
};

export default { generateAndPublish, getMatchForUser };
