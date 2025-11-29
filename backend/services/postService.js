import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Match from "../models/matchModel.js";
import { createVideoPost } from "./videoService.js";
import { handleSuccessfulPost } from "./progressService.js";
import { sendEmail } from "../utils/sendEmail.js";

const notifyPartnerOfPost = async ({ actorUserId, post }) => {
  try {
    const actor = await User.findById(actorUserId).select("username currentMatchId");
    if (!actor?.currentMatchId) return;

    const match = await Match.findById(actor.currentMatchId).lean();
    if (!match) return;

    const partnerId = String(match.userA) === String(actorUserId) ? match.userB : match.userA;
    if (!partnerId) return;

    const partner = await User.findById(partnerId).select("email username canEmail");
    if (!partner?.email || partner.canEmail === false) return;

    const actorName = actor.username || "Your partner";
    const partnerName = partner.username || "there";
    const mediaLabel = post?.media?.mime?.startsWith("video/") ? "video" : "post";

    await sendEmail({
      to: partner.email,
      subject: `${actorName} just shared a new ${mediaLabel}`,
      body: `Hi ${partnerName}, ${actorName} just uploaded a new ${mediaLabel} on LinguaPals. Log in to view it!`,
      canEmail: partner.canEmail
    });
  } catch (err) {
    console.error("Failed to send partner notification email:", err);
  }
};

export const getPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).lean();
    
    // Build query to only get posts from user and their matched partner
    const query = { userId };
    
    if (user && user.currentMatchId) {
      // If user has a match, also get posts from the same match
      query.$or = [
        { userId },
        { matchId: user.currentMatchId }
      ];
      delete query.userId;
    }
    
    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: posts });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ success: false, message: "Missing request body" });

    let post;
    if (payload.type === "video") {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Video file is required for video posts"
        });
      }

      post = await createVideoPost({
        userId: req.userId,
        body: payload,
        file: req.file
      });
    } else {
      // 🔒 SECURITY FIX: Server-populate matchId for non-video posts
      const user = await User.findById(req.userId).select('currentMatchId').lean();
      const matchId = user?.currentMatchId || null;

      post = new Post({
        ...payload,
        userId: req.userId,
        matchId
      });
      await post.save();
    }

    await notifyPartnerOfPost({ actorUserId: req.userId, post });

    // Handle streak and level progression after successful post creation
    if (req.userId) {
      try {
        const progressData = await handleSuccessfulPost(req.userId);
        return res.status(201).json({ 
          success: true, 
          data: post, 
          user: { 
            level: progressData.level,
            streakCount: progressData.streakCount
          } 
        });
      } catch (progressErr) {
        // If progress update fails, still return post (graceful degradation)
        console.error("Progress update failed:", progressErr);
        return res.status(201).json({ 
          success: true, 
          data: post, 
          warning: "Post created but progress not updated" 
        });
      }
    }

    return res.status(201).json({ success: true, data: post });
  } catch (e) {
    console.error("Error creating post:", e);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    
    // Only allow user to delete their own posts
    if (String(post.userId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
    }
    
    // Delete GridFS file if it exists
    if (post.storage?.storageId) {
      try {
        const storage = await import("../lib/storage/mongoBlobStorage.js");
        await storage.remove(post.storage.storageId);
      } catch (cleanupError) {
        // Log but don't fail the request - best-effort cleanup
        console.error("Failed to delete GridFS file:", cleanupError);
      }
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (e) {
    console.error("Error deleting post:", e);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    
    // Only allow user to update their own posts
    if (String(post.userId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this post" });
    }
    
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const listMyDailyPost = async (req, res) => {
  try {
    const { dateId } = req.query;
    const doc = await Post.findOne({ userId: req.userId, dateId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: doc ? [doc] : [] });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const listPartnerDailyPost = async (req, res) => {
  try {
    const { dateId, matchId } = req.query;
    
    // 🔒 SECURITY FIX: Validate matchId belongs to requesting user
    const user = await User.findById(req.userId).select('currentMatchId').lean();
    
    // If user has no match, return empty
    if (!user || !user.currentMatchId) {
      return res.status(200).json({ success: true, data: [] });
    }
    
    // Verify requested matchId matches user's actual match
    if (String(matchId) !== String(user.currentMatchId)) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view posts from this match" 
      });
    }
    
    const doc = await Post.findOne({ 
      matchId, 
      dateId, 
      userId: { $ne: req.userId } 
    }).sort({ createdAt: 1 });
    
    return res.status(200).json({ success: true, data: doc ? [doc] : [] });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const playPost = async (req, res) => {
  try {
    const doc = await Post.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Post not found" });
    
    // Verify user can access this post (own post or matched partner's post)
    const user = await User.findById(req.userId).lean();
    const isOwnPost = String(doc.userId) === String(req.userId);
    const isMatchedPost = user && user.currentMatchId && String(doc.matchId) === String(user.currentMatchId);
    
    if (!isOwnPost && !isMatchedPost) {
      return res.status(403).json({ success: false, message: "Not authorized to view this post" });
    }
    
    return res.status(200).json({ success: true, data: { id: doc._id, storage: doc.storage, media: doc.media, status: doc.status } });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const streamPost = async (req, res) => {
  try {
    console.log('Stream request received for post:', req.params.id);
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    
    // For video streaming, accept token from query param (since <video> tag can't send headers)
    let userId = req.userId; // From middleware
    
    // If no userId from middleware, try query param token
    if (!userId && req.query.token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(req.query.token, process.env.JWT_SECRET || "dev_secret");
        userId = decoded.userID; // Note: JWT uses userID not userId
        console.log('Token verified, userId:', userId);
      } catch (tokenError) {
        console.error("Token verification error:", tokenError.message);
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
    }
    
    if (!userId) {
      console.error('No userId found');
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.error('Post not found:', req.params.id);
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    
    console.log('Post found, storage:', post.storage);
    
    // Verify user can access this post (own post or matched partner's post)
    const user = await User.findById(userId).lean();
    const isOwnPost = String(post.userId) === String(userId);
    const isMatchedPost = user && user.currentMatchId && String(post.matchId) === String(user.currentMatchId);
    
    console.log('Access check - isOwnPost:', isOwnPost, 'isMatchedPost:', isMatchedPost);
    
    if (!isOwnPost && !isMatchedPost) {
      console.error('User not authorized to view post');
      return res.status(403).json({ success: false, message: "Not authorized to view this post" });
    }
    
    // Check if storage info exists
    if (!post.storage?.storageId) {
      console.error('No storage info for post');
      return res.status(404).json({ success: false, message: "Video file not found" });
    }
    
    // Stream video from GridFS
    try {
      const storage = await import("../lib/storage/mongoBlobStorage.js");
      const videoStream = storage.getReadStream(post.storage.storageId);
      
      console.log('Video stream created');
      
      // Set proper headers for video streaming
      res.setHeader("Content-Type", post.media?.mime || "video/mp4");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Access-Control-Allow-Origin", "*");
      
      // Handle stream errors
      videoStream.on("error", (error) => {
        console.error("GridFS stream error:", error);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: "Error streaming video" });
        }
      });
      
      // Pipe GridFS stream to response
      videoStream.pipe(res);
      console.log('Video stream piped to response');
      
    } catch (streamError) {
      console.error("Failed to create video stream:", streamError);
      return res.status(500).json({ success: false, message: "Failed to stream video" });
    }
    
  } catch (e) {
    console.error("Error in streamPost:", e);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};