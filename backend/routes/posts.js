import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { getPosts, createPost, deletePost, updatePost, listMyDailyPost, listPartnerDailyPost, playPost } from "../services/postService.js";
const router = express.Router();

router.get("/", requireAuth, getPosts);
router.post("/", requireAuth, createPost);
router.delete("/:id", requireAuth, deletePost);
router.put("/:id", requireAuth, updatePost);
router.get("/daily", requireAuth, listMyDailyPost);
router.get("/partner", requireAuth, listPartnerDailyPost);
router.get("/:id/play", requireAuth, playPost);

export default router;
