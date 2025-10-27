import "./loadEnviroment.js";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connecting to MongoDB
mongoose.connect(process.env.ATLAS_URI)
.then(() => console.log("Connected to MongoDB."))
.catch(error => console.error("MongoDB connection error:", error));

app.use("/api/posts", postRoutes)
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () => console.log(` Server running on http://localhost:${process.env.PORT}`));