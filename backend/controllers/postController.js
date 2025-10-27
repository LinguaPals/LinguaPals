import mongoose from "mongoose";
import Post from '../models/postModel.js';

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({});
        res.status(200).json({ success: true, data: posts});
    } catch (error) {
        console.log("error in  fetching posts");
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const createPost = async (req, res) => {
    const post = req.body;

    if(false) { // fill in later
        return res.status(400).json({ success:false, message: "Provide all fields"});
    }

    const newPost = new Post(post)

    try {
        await newPost.save();
        res.status(201).json({ success: true, data: newPost});
    } catch (error) {
        console.error("Error in Create Post:", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

export const deletePost = async (req, res) => {
    const {id} = req.params;
    console.log("id: ", id);

    try {
        await Post.findByIdAndDelete(id);
        res.status(200).json({success: true, message: "Post deleted" });
    } catch(error) {
        console.log("error in deleting post: ", error.message);
        res.status(500).json({success: false, message: "Server error" });
    }
}

export const updatePost = async (req, res) => {
    const {id} = req.params;

    const post = req.body;

    try {
        const updatedPost = await Post.findByIdAndUpdate(id, post, {new:true})
        res.status(200).json({ success: true, data: updatedPost });
    } catch(error) {
        res.status(500).json({ success: false, message: "Server Error" })
    }
}