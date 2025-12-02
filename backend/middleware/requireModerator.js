import User from "../models/userModel.js";

export default async function requireModerator(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.userId).select("isModerator");
    if (!user || user.isModerator !== true) {
      return res.status(403).json({ success: false, message: "Moderator privileges required" });
    }

    next();
  } catch (error) {
    console.error("Moderator auth failed", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
