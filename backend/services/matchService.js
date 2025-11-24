import Match from "../models/matchModel.js"
import User from "../models/userModel.js"
import { getWeekTag } from "../utils/dateIds.js"

const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

export const requestMatchForUser = async (userId, weekTag = getWeekTag()) => {
  const user = await User.findById(userId)
  if (!user) return { matched: false, waiting: false }
  const language = (user.language || "").trim().toLowerCase()
  if (!language) return { matched: false, waiting: false }
  if (user.isMatched && user.currentMatchId) {
    const match = await Match.findById(user.currentMatchId).lean()
    if (!match) {
      user.isMatched = false
      user.currentMatchId = null
      await user.save()
    } else {
      const partnerId = String(match.userA) === String(userId) ? match.userB : match.userA
      const partner = await User.findById(partnerId);
      return { matched: true, matchId: match._id, partnerId, partnerUsername: partner.username }
    }
  }
  const partner = await User.findOne({
    _id: { $ne: userId },
    language,
    isMatched: false,
    canMatch: true
  })
  if (partner) {
    const match = await Match.create({ weekTag, userA: user._id, userB: partner._id })
    user.currentMatchId = match._id
    user.isMatched = true
    user.canMatch = false
    user.partnerUsername = partner.username;
    partner.partnerUsername = user.username;
    partner.currentMatchId = match._id
    partner.isMatched = true
    partner.canMatch = false
    
    await user.save()
    await partner.save()
    return { matched: true, matchId: match._id, partnerId: partner._id, partnerUsername: partner.username }
  }
  user.isMatched = false
  user.currentMatchId = null
  user.canMatch = true
  await user.save()
  return { matched: false, waiting: true }
}

export const generateAndPublish = async (weekTag = getWeekTag()) => {
  const users = await User.find({ language: { $exists: true, $ne: null } }, "_id language").lean()
  const groups = new Map()
  for (const u of users) {
    const k = String(u.language || "").trim().toLowerCase()
    if (!k) continue
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k).push(u._id)
  }
  const pairs = []
  for (const [, ids] of groups) {
    shuffle(ids)
    for (let i = 0; i + 1 < ids.length; i += 2) pairs.push([ids[i], ids[i + 1]])
  }
  await Match.deleteMany({ weekTag })
  const docs = pairs.map(p => ({ weekTag, userA: p[0], userB: p[1] }))
  let inserted = []
  if (docs.length) inserted = await Match.insertMany(docs)
  const pairedIds = new Set()
  for (const d of inserted) {
    pairedIds.add(String(d.userA))
    pairedIds.add(String(d.userB))
  }
  if (inserted.length) {
    const ops = []
    for (const d of inserted) {
      ops.push({ updateOne: { filter: { _id: d.userA }, update: { currentMatchId: d._id, isMatched: true, canMatch: false } } })
      ops.push({ updateOne: { filter: { _id: d.userB }, update: { currentMatchId: d._id, isMatched: true, canMatch: false } } })
    }
    await User.bulkWrite(ops)
  }
  if (users.length) {
    await User.updateMany(
      { _id: { $in: users.map(u => u._id).filter(id => !pairedIds.has(String(id))) } },
      { currentMatchId: null, isMatched: false, canMatch: false }
    )
  }
  return inserted
}

export const getMatchForUser = async (userId, weekTag = getWeekTag()) => {
  console.log("Searching for match")
  const match = await Match.findOne({ weekTag, $or: [{ userA: userId }, { userB: userId }] }).lean()
  if (!match) {
    console.log("Couldn't find match")
    return null
  }
  const partnerId = String(match.userA) === String(userId) ? match.userB : match.userA
  return { matchId: match._id, partnerId }
}

export const deleteMatchForUser = async (userId, weekTag = getWeekTag()) => {
  const user = await User.findById(userId)
  if (!user || !user.currentMatchId) return { success: false, message: "No match found" }
  const match = await Match.findById(user.currentMatchId)
  if (!match) {
    user.isMatched = false
    user.currentMatchId = null
    user.canMatch = false
    user.partnerUsername = null
    await user.save()
    return { success: false, message: "No match found" }
  }
  const partnerId = String(match.userA) === String(userId) ? match.userB : match.userA
  const partner = await User.findById(partnerId)
  user.isMatched = false
  user.currentMatchId = null
  user.canMatch = true
  user.partnerUsername = null
  if (partner) {
    partner.isMatched = false
    partner.currentMatchId = null
    partner.canMatch = true
    partner.partnerUsername = null
    await partner.save()
  }
  await user.save()
  await Match.deleteOne({ _id: match._id })
  return { success: true, deletedMatchId: match._id, partnerId }
}

export default { requestMatchForUser, generateAndPublish, getMatchForUser, deleteMatchForUser }
