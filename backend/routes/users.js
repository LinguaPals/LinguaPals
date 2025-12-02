import express from "express";
const router = express.Router();
import requireAuth from "../middleware/requireAuth.js";
import { updateUser, getCurrentUser } from "../services/userService.js";

router.get("/me", requireAuth, getCurrentUser);
router.put("/:id", requireAuth, updateUser);

export default router;