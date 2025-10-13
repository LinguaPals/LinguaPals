// backend/index.js
import "./loadEnviroment.js";       // loads .env once

import express from "express";
import cors from "cors";

// Importing this ensures the DB connects once at startup.
// (conn.js exports a connected db instance on import)
import { connectDB } from "./db/conn.js";


import healthRouter from "./routes/health.js";

const PORT = parseInt(process.env.PORT || "5050", 10);
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

// Health check
app.use("/health", healthRouter);

// (Optional) When you’re ready, mount your posts routes here:
// import postsRouter from "./routes/posts.js";
// app.use("/posts", postsRouter);

const start = async () => {
  try {
    await connectDB(); // connect once at startup
    app.listen(PORT, () => {
      console.log(`✅ API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err?.message || err);
    process.exit(1);
  }
};

start();
