import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import db from "../db/conn.js";


export const postMessage = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const username = user.username;
        const matchId = user.currentMatchId;
        if(!matchId)
            return res.status(400).json({ success: false, message: "No current match to send message to" });

        const { text } = req.body;

        const message = await Message.create({
            matchId,
            username,
            text,
            deliveredAt: null,
        })
        res.status(201).json({ success: true, data: message });
    } catch (error) {
        console.error("10: Error posting message: ", error.message);
        res.status(500).json({ success: false, message: "Post Message Failed" });
    }
};

export const getMatchMessages = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const matchId = user.currentMatchId;
        if(!matchId)
            return res.status(400).json({ success: false, message: "No current match to send message to" });

        const messages = await Message.find({ matchId }).sort({ createdAt: 1});
        res.status(201).json({ success: true, data: messages });
    } catch (error) {
        console.error("Error fetching chat messages", error);
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
}

