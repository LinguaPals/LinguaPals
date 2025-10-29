import express from "express";
const router = express.Router();
import { updateUser } from "../controllers/userController.js";

router.put("/:id", updateUser);

export default router;