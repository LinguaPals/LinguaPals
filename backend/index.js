// backend/index.js
import "./loadEnviroment.js";

import express from "express";
import cors from "cors";
import { connectDB, getDb } from "./db/conn.js";
import healthRouter from "./routes/health.js";
import { initFirebaseAdmin } from "./lib/firebaseAdmin.js";
import { ensureIndexes } from "./startup/ensureIndexes.js";
import authRouter from "./routes/auth.js";

const PORT = parseInt(process.env.PORT || "5050", 10);
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const app = express();
app.use(
  cors({
    origin: ORIGIN,
    credentials: true, // allow cookies if needed later
  })
);
app.use(express.json());

// Health check
app.use("/health", healthRouter);

// Auth session endpoint (expects Firebase ID token from frontend)
app.use("/auth", authRouter);

const start = async () => {
  try {
    // 1) Connect to Mongo once
    await connectDB();

    // 2) Initialize Firebase Admin (fails fast if creds misconfigured)
    initFirebaseAdmin();

    // 3) Enforce unique indexes (email + firebaseUid)
    await ensureIndexes(getDb());

    app.listen(PORT, () => {
      console.log(`✅ API listening on http://localhost:${PORT}`);
      console.log(`   CORS origin: ${ORIGIN}`);
    });
  } catch (err) {
    console.error("❌ Startup failure:", err?.message || err);
    process.exit(1);
  }
};

start();
