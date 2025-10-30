import express from "express";
import Notification from "../models/notificationModel.js";
const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const { userId, event, meta } = req.body || {};
    if (!userId || !event) return res.status(400).json({ success: false, message: "Missing userId or event" });
    const n = await Notification.create({ userId, event, meta: meta || {} });
    return res.status(200).json({ success: true, data: n });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
