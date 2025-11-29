import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { uploadSingleVideo } from "../middleware/uploadVideo.js";
import { handleMulterError } from "../middleware/errorHandler.js";
import { 
  getPosts, 
  createPost, 
  deletePost, 
  updatePost, 
  listMyDailyPost, 
  listPartnerDailyPost, 
  playPost,
  streamPost 
} from "../services/postService.js";

const router = express.Router();

router.get("/", requireAuth, getPosts);

// Add uploadSingleVideo middleware BEFORE createPost
router.post("/", requireAuth, uploadSingleVideo, handleMulterError, createPost);

router.delete("/:id", requireAuth, deletePost);
router.put("/:id", requireAuth, updatePost);
router.get("/daily", requireAuth, listMyDailyPost);
router.get("/partner", requireAuth, listPartnerDailyPost);
router.get("/:id/play", requireAuth, playPost);

// New streaming endpoint
router.get("/:id/stream", streamPost);

export default router;