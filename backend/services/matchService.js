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
  let inserted = [];
  if (docs.length) inserted = await Match.insertMany(docs);
  const pairedIds = new Set();
  for (const d of inserted) {
    pairedIds.add(String(d.userA));
    pairedIds.add(String(d.userB));
  }
  if (inserted.length) {
    const ops = [];
    for (const d of inserted) {
      ops.push({ updateOne: { filter: { _id: d.userA }, update: { currentMatchId: d._id } } });
      ops.push({ updateOne: { filter: { _id: d.userB }, update: { currentMatchId: d._id } } });
    }
    await User.bulkWrite(ops);
  }
  if (users.length) {
    await User.updateMany(
      { _id: { $in: users.map(u => u._id).filter(id => !pairedIds.has(String(id))) } },
      { currentMatchId: null }
    );
  }
  return inserted;
};

export const getMatchForUser = async (userId, weekTag = getWeekTag()) => {
  console.log("Searching for match");
  const match = await Match.findOne({ weekTag, $or: [{ userA: userId }, { userB: userId }] }).lean();
  if (!match) {
    console.log("Couldn't find match");
    return null;
  }
  const partnerId = String(match.userA) === String(userId) ? match.userB : match.userA;
  return { matchId: match._id, partnerId };
};

export const deleteMatchForUser = async (userId, weekTag = getWeekTag()) => {
  console.log("Im in matchService.js");
  const match = await Match.findOne({ weekTag, $or: [{ userA: userId }, { userB: userId }] });
  if (!match) {
    console.log("No match found for user to delete");
    return { success: false, message: "No match found" };
  }
  await Match.deleteOne({ _id: match._id });
  await User.updateMany(
    { _id: { $in: [match.userA, match.userB] } },
    { currentMatchId: null }
  );
  console.log(`Deleted match ${match._id} for user ${userId}`);
  return { success: true, deletedMatchId: match._id };
};

export default { generateAndPublish, getMatchForUser, deleteMatchForUser };
