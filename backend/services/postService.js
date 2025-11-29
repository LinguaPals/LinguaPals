import mongoose from "mongoose";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { createVideoPost } from "./videoService.js";
import { handleSuccessfulPost } from "./progressService.js";

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
      // Video posts require a file upload
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "Video file is required for video posts" 
        });
      }
      
      // Pass the file to createVideoPost
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
        userId: req.userId,      // Always use authenticated userId
        matchId                  // Always use server-side matchId
      });
      await post.save();
    }

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
    // For video streaming, accept token from query param (since <video> tag can't send headers)
    let userId = req.userId; // From middleware
    
    // If no userId from middleware, try query param token
    if (!userId && req.query.token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET || "dev_secret");
        userId = decoded.userId;
      } catch (tokenError) {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
    }
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    
    // Verify user can access this post (own post or matched partner's post)
    const user = await User.findById(userId).lean();
    const isOwnPost = String(post.userId) === String(userId);
    const isMatchedPost = user && user.currentMatchId && String(post.matchId) === String(user.currentMatchId);
    
    if (!isOwnPost && !isMatchedPost) {
      return res.status(403).json({ success: false, message: "Not authorized to view this post" });
    }
    
    // Check if storage info exists
    if (!post.storage?.storageId) {
      return res.status(404).json({ success: false, message: "Video file not found" });
    }
    
    // Stream video from GridFS
    try {
      const storage = await import("../lib/storage/mongoBlobStorage.js");
      const videoStream = storage.getReadStream(post.storage.storageId);
      
      // Set proper headers for video streaming
      res.setHeader("Content-Type", post.media?.mime || "video/mp4");
      res.setHeader("Accept-Ranges", "bytes");
      
      // Handle stream errors
      videoStream.on("error", (error) => {
        console.error("GridFS stream error:", error);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: "Error streaming video" });
        }
      });
      
      // Pipe GridFS stream to response
      videoStream.pipe(res);
      
    } catch (streamError) {
      console.error("Failed to create video stream:", streamError);
      return res.status(500).json({ success: false, message: "Failed to stream video" });
    }
    
  } catch (e) {
    console.error("Error in streamPost:", e);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};