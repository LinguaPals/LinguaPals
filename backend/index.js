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
import messageRoutes from "./routes/messages.js";
import requireAuth from "./middleware/requireAuth.js";
import scheduler from "./startup/scheduler.js";
import passport from "passport";
import { on } from "./lib/events.js";
import { handleDailyStreakRollOver } from "./services/progressService.js";

dotenv.config({});

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

mongoose.connect(process.env.ATLAS_URI).then(() => console.log("Connected to MongoDB.")).catch(e => console.error("MongoDB connection error:", e));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/state", requireAuth, stateRoutes);
app.use("/api/matches", requireAuth, matchRoutes);
app.use("/api/notify", notifyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", requireAuth, messageRoutes);


on("DAILY_WINDOW_OPEN", async () => {
  try {
    const results = await handleDailyStreakRollOver();
    console.log("Daily streak rollover complete", results);
  } catch (err) {
    console.error("Daily streak rollover failed", err);
  }
});

scheduler();

app.listen(process.env.PORT, () => console.log(`Server running on http://localhost:${process.env.PORT}`));
