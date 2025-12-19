import express from "express"
import { postMessage, getMatchMessages } from "../services/messageService.js"
import requireAuth from "../middleware/requireAuth.js";
const router = express.Router()

router.post("/send", requireAuth, postMessage);
router.get("/retrieve", requireAuth, getMatchMessages);

export default router;