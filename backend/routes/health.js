// backend/routes/health.js
import { Router } from "express";
import { getDb } from "../db/conn.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await getDb().command({ ping: 1 }); // proves the connection is usable
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    res.status(500).json({ ok: false, db: "disconnected", error: err.message });
  }
});

export default router;
