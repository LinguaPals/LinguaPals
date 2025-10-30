import mongoose from "mongoose";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) return res.status(400).json({ success: false, message: "Missing email or password" });
    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) return res.status(400).json({ success: false, message: "Email already in use" });
    const newUser = new User({ email: trimmedEmail, password: trimmedPassword });
    await newUser.save();
    const token = jwt.sign({ userID: newUser._id.toString() }, process.env.JWT_SECRET || "dev_secret");
    return res.status(201).json({ success: true, data: { token, userID: newUser._id.toString() } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    user.comparePassword(trimmedPassword, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });
      const token = jwt.sign({ userID: user._id.toString() }, process.env.JWT_SECRET || "dev_secret");
      return res.status(200).json({ success: true, data: { token, userID: user._id.toString() } });
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const login = signIn;
