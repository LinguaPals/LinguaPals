import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import requireModerator from "../middleware/requireModerator.js";
import {
  listAllPosts,
  deletePostAsModerator,
  listAllUsers,
  deleteUserAsModerator
} from "../services/adminService.js";

const router = express.Router();

router.use(requireAuth, requireModerator);

router.get("/posts", listAllPosts);
router.delete("/posts/:id", deletePostAsModerator);
router.get("/users", listAllUsers);
router.delete("/users/:id", deleteUserAsModerator);

export default router;
