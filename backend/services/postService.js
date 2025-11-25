import mongoose from "mongoose";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { createVideoPost } from "./videoService.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
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
      post = await createVideoPost({ userId: req.userId, body: payload });
    } else {
      post = new Post(payload);
      await post.save();
    }

    // Increment user level every time a post is created
    if (req.userId) {
      try {
        const updatedUser = await User.findByIdAndUpdate(
          req.userId,
          { $inc: { level: 1 } },
          { new: true, select: "level" }
        );
        return res.status(201).json({ success: true, data: post, user: { level: updatedUser?.level } });
      } catch (incErr) {
        // If increment fails, still return post
        return res.status(201).json({ success: true, data: post, warning: "Post created but level not incremented" });
      }
    }

    return res.status(201).json({ success: true, data: post });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updatePost = async (req, res) => {
  try {
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
    const doc = await Post.findOne({ matchId, dateId, userId: { $ne: req.userId } }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: doc ? [doc] : [] });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const playPost = async (req, res) => {
  try {
    const doc = await Post.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Post not found" });
    return res.status(200).json({ success: true, data: { id: doc._id, storage: doc.storage, media: doc.media, status: doc.status } });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
