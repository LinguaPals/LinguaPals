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
import requireAuth from "./middleware/requireAuth.js";
import scheduler from "./startup/scheduler.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.ATLAS_URI).then(() => console.log("Connected to MongoDB.")).catch(e => console.error("MongoDB connection error:", e));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/state", requireAuth, stateRoutes);
app.use("/api/matches", requireAuth, matchRoutes);
app.use("/api/notify", notifyRoutes);


scheduler();

app.listen(process.env.PORT, () => console.log(`Server running on http://localhost:${process.env.PORT}`));
