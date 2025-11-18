import express from "express"
import passport from "passport";
const router = express.Router();
import  { signUp, login, googleAuth, googleAuthCallback } from "../services/authService.js";

router.post('/signup', signUp);
router.post('/login', login);
router.get('/google', googleAuth);
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), 
    googleAuthCallback
);
export default router;