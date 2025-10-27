import mongoose from 'mongoose';
import  User from '../models/UserModel.js';

export const signUp = async (req, res) => {
    try {
        const { email, password } = req.body;

        // determines if user already exists and throws error if so
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: "Email already registered."});
        
        // creates new user
        const newUser = new User({
            email: email,
            password: password
        });
        
        // saves new user
        await newUser.save();

        // returns the new user's id
        return res.status(201).json({success: true, userID: newUser._id.toString()});
    } catch(error) {
        console.error("Error: ", error.message);
        return res.status(500).json({success: false, message: "Server Error"});
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existing = await User.findOne({ email });
        if (!existing) return res.status(400).json({ success: false, message: "Email not found."});

        // determines if user's password is correct
        existing.comparePassword(password, (error, isMatch) => {
        if (error) return res.status(500).json({ success: false, message: "Server error."});
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password."});

        // return user's id upon successful password
        return res.status(200).json({ success: true, userID: existing._id.toString()});
        });
    } catch(error) {
        console.error("Error: ", error.message);
        return res.status(500).json({success: false, message: "Server Error"});
    }
}