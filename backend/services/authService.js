import mongoose from 'mongoose';
import  User from '../models/userModel.js';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
dotenv.config();

export const signUp = async (req, res) => {
    try {
        const { email, password } = req.body;
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        // error checking to ensure that both fields are filled out
        if (!trimmedEmail || !trimmedPassword) return res.status(400).json({ success: false, message: "Please fill out all fields." });

        // check that the email entered is in valid format
        if (!validateEmail(trimmedEmail)) return res.status(400).json({ success: false, message: "Email not in valid format." });

        // determines if user already exists and throws error if so
        const existing = await User.findOne({ email: trimmedEmail });
        if (existing) return res.status(400).json({ success: false, message: "Email already registered." });
        
        // creates new user
        const newUser = new User({
            email: trimmedEmail,
            password: password
        });
    
        // saves new user
        await newUser.save();

        // generates JWT
        const token = jwt.sign({userID: newUser._id.toString()}, process.env.JWT_SECRET, { expiresIn: '1h'});

        // returns the new user's id and JWT token
        return res.status(201).json({success: true, data: {token: token, userID: newUser._id.toString()}});
    } catch(error) {
        console.error("Error: ", error.message);
        return res.status(500).json({success: false, message: "Server Error"});
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        // error checking to ensure that both fields are filled out 
        if (!trimmedEmail || !trimmedPassword) return res.status(400).json({ success: false, message: "Please fill out all fields." });

        // check that the email entered is in valid format
        if (!validateEmail(trimmedEmail)) return res.status(400).json({ success: false, message: "Email not in valid format." });

        // finds the email of the existing user
        const existing = await User.findOne({ email: trimmedEmail });
        if (!existing) return res.status(400).json({ success: false, message: "Email not found."});

        // determines if user's password is correct
        existing.comparePassword(password, (error, isMatch) => {
        if (error) return res.status(500).json({ success: false, message: "Server error."});
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid password."});

        // generate JWT
        const token = jwt.sign({userID: existing._id.toString()}, process.env.JWT_SECRET, { expiresIn: '1h'});

        // return user's id upon successful password
        return res.status(200).json({ success: true, data: {token: token, userID: existing._id.toString()}});
        });
    } catch(error) {
        console.error("Error: ", error.message);
        return res.status(500).json({success: false, message: "Server Error"});
    }
}

// helper function to validate email
function validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

async function findOrCreateGoogleUser(googleID, email) {
    const existing = await User.findOne({ email: email });
        if (existing) { 
            if (!existing.googleID) {
                existing.googleID = googleID;
                await existing.save()
            }
            return existing;
        }
    
    const user = new User({
        googleID: googleID,          
        email: email,
        isNewGoogle: true 
    });

    const newUser = true;
    await user.save();
    return user;
};

// Initialize passport strategy - wrapped in function to ensure env vars are loaded
const initializeGoogleStrategy = () => {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientID || !clientSecret) {
        console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables');
        return;
    }

    passport.use(new GoogleStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: "http://localhost:5050/api/auth/google/callback"
      },
      async function(accessToken, refreshToken, profile, cb) {
        try {
            const user = await findOrCreateGoogleUser(profile.id, profile.emails[0].value);
            return cb(null, user);
        } catch(err) {
            return cb(err, null);
        }
      }
    ));
};

// Call initialization immediately
initializeGoogleStrategy();

export const googleAuth = passport.authenticate('google', { 
    scope: ['profile', 'email'], session: false 
});

export const googleAuthCallback = (req, res) => {
    const token = jwt.sign({userID: req.user._id.toString()}, process.env.JWT_SECRET, { expiresIn: '1h'})

    res.redirect(`http://localhost:5173/login?token=${token}&userID=${req.user._id.toString()}&isNew=${req.user.isNewGoogle}`);
};