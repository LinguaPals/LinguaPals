import express from "express"
import { postMessage } from "../services/messageService.js"
import requireAuth from "../middleware/requireAuth.js";
const router = express.Router()

router.post("/send", requireAuth, postMessage);

export default router;