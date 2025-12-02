import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Match from "../models/matchModel.js";

export const listAllPosts = async (_req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("Failed to list posts", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deletePostAsModerator = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (post.storage?.storageId) {
      try {
        const storage = await import("../lib/storage/mongoBlobStorage.js");
        await storage.remove(post.storage.storageId);
      } catch (cleanupError) {
        console.error("Failed to delete GridFS asset", cleanupError);
      }
    }

    await Post.findByIdAndDelete(post._id);
    return res.status(200).json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("Failed to delete post", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const listAllUsers = async (_req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Failed to list users", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteUserAsModerator = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (String(userId) === String(req.userId)) {
      return res.status(400).json({ success: false, message: "Cannot delete yourself" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete all posts by this user
    await Post.deleteMany({ userId });

    // Delete user from matches
    await Match.deleteMany({ $or: [{ userA: userId }, { userB: userId }] });

    // Delete the user
    await User.findByIdAndDelete(userId);
    
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Failed to delete user", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
