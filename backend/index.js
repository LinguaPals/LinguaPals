import "./loadEnviroment.js";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
import stateRoutes from "./routes/state.js";
import matchRoutes from "./routes/matches.js";
import notifyRoutes from "./routes/notify.js";
import adminRoutes from "./routes/admin.js";
import learningRoutes from "./routes/learning.js";
import requireAuth from "./middleware/requireAuth.js";
import scheduler from "./startup/scheduler.js";
import passport from "passport";
import { on } from "./lib/events.js";
import { handleDailyStreakRollOver } from "./services/progressService.js";
import { initializeLearningContent } from "./justLanguage/core/index.js";

dotenv.config({});

// CREATE EXPRESS APP (you were missing this!)
const app = express();

// SETUP MIDDLEWARE (you were missing this!)
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// CONNECT TO DB AND INITIALIZE
mongoose.connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("Connected to MongoDB.");
    return initializeLearningContent();
  })
  .then(() => {
    console.log("✅ Server initialization complete - mounting routes...\n");
    
    // Mount all routes
    app.use("/api/auth", authRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/state", requireAuth, stateRoutes);
    app.use("/api/matches", requireAuth, matchRoutes);
    app.use("/api/notify", notifyRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/learn", requireAuth, learningRoutes);
    
    // Setup event listeners
    on("DAILY_WINDOW_OPEN", handleDailyStreakRollOver);
    
    // Start scheduler
    scheduler();
    
    // Start server
    app.listen(process.env.PORT, () => 
      console.log(`Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch(e => {
    console.error("❌ Server startup failed:", e);
    process.exit(1);
  });