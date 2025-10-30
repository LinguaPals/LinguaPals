import express from "express";
import { getStateForUser } from "../services/userStateService.js";
const router = express.Router();

router.get("/me", async (req, res) => {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  try {
    const state = await getStateForUser(req.userId);
    return res.status(200).json({ success: true, data: state });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
