import express from "express";
import mongoose from "mongoose";
import Post from '../models/postModel.js';
import { getPosts, createPost, deletePost, updatePost } from "../controllers/postController.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", createPost);
router.delete("/:id", deletePost)
router.put("/:id", updatePost)

export default router;