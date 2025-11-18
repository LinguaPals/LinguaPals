import express from "express";
import { requestMatchForUser, generateAndPublish, getMatchForUser, deleteMatchForUser } from "../services/matchService.js";
import { getWeekTag } from "../utils/dateIds.js";
const router = express.Router();

router.get("/current", async (req, res) => {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  try {
    const weekTag = getWeekTag();
    const match = await getMatchForUser(req.userId, weekTag);
    return res.status(200).json({ success: true, data: match });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.post("/request", async (req, res) => {
  if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  try {
    const result = await requestMatchForUser(req.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.post("/publish", async (req, res) => {
  try {
    const weekTag = getWeekTag();
    const pairs = await generateAndPublish(weekTag);
    return res.status(200).json({ success: true, data: pairs });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.delete("/delete-match", async (req, res) => {
  console.log("Yo im in the delete-match func");
  if (!req.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const result = await deleteMatchForUser(req.userId);
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, message: "Match deleted", data: result });
  } catch (error) {
    console.error("Error deleteing match:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
