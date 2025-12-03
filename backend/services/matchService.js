import Match from "../models/matchModel.js"
import User from "../models/userModel.js"
import Post from "../models/postModel.js"
import { getWeekTag } from "../utils/dateIds.js"

const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

export const requestMatchForUser = async (userId, weekTag = getWeekTag()) => {
  // 1. Load the user
  const user = await User.findById(userId)
  if (!user) return { matched: false, waiting: false }
  
  // 2. Normalize and validate language
  const language = (user.language || "").trim().toLowerCase()
  if (!language) return { matched: false, waiting: false }
  
  // 3. Check if user is already matched
  if (user.isMatched && user.currentMatchId) {
    const match = await Match.findById(user.currentMatchId).lean()
    
    // Match doesn't exist (stale data) - reset user
    if (!match) {
      user.isMatched = false
      user.currentMatchId = null
      user.canMatch = false
      await user.save()
      // Continue to partner search below
    } else {
      // Match exists - return existing match
      const partnerId = String(match.userA) === String(userId) ? match.userB : match.userA
      const partner = await User.findById(partnerId)
      return { 
        matched: true, 
        matchId: match._id, 
        partnerId, 
        partnerUsername: partner?.username 
      }
    }
  }
  
  // 4. Search for eligible partners (RANDOM SELECTION)
  const candidates = await User.find({
    _id: { $ne: userId },
    language,
    isMatched: false,
    canMatch: true
  })
  
  // No partners available - user enters waiting pool
  if (candidates.length === 0) {
    user.isMatched = false
    user.currentMatchId = null
    user.canMatch = true  // User becomes waiting
    await user.save()
    return { matched: false, waiting: true }
  }
  
  // Partner(s) found - select one randomly
  const randomIndex = Math.floor(Math.random() * candidates.length)
  const partner = candidates[randomIndex]
  
  // Create the match
  const match = await Match.create({ 
    weekTag, 
    userA: user._id, 
    userB: partner._id 
  })
  
  // Update both users
  user.currentMatchId = match._id
  user.isMatched = true
  user.canMatch = false
  user.partnerUsername = partner.username
  
  partner.currentMatchId = match._id
  partner.isMatched = true
  partner.canMatch = false
  partner.partnerUsername = user.username
  
  await user.save()
  await partner.save()
  
  return { 
    matched: true, 
    matchId: match._id, 
    partnerId: partner._id, 
    partnerUsername: partner.username 
  }
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
  const match = await Match.findOne({ weekTag, $or: [{ userA: userId }, { userB: userId }] }).lean()
  if (!match) {
    return null
  }
  const partnerId = String(match.userA) === String(userId) ? match.userB : match.userA
  const partner = await User.findById(partnerId).select("username").lean()
  return { matchId: match._id, partnerId, partnerUsername: partner?.username || null }
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
  await Post.deleteMany({ matchId: match._id });
  return { success: true, deletedMatchId: match._id, partnerId }
}

export default { requestMatchForUser, generateAndPublish, getMatchForUser, deleteMatchForUser }
