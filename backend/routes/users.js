import express from "express";
const router = express.Router();
import { updateUser } from "../services/userService.js";

router.put("/:id", updateUser);

export default router;