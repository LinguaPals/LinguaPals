import User from "../models/userModel.js";
import { mapUserLanguageToDictCode, mapDictCodeToLanguageName } from "../utils/learning/languageMapping.js";

// updates user
export const updateUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (!req.userId || String(req.userId) !== String(targetUserId)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this user" });
    }

    const updates = { ...req.body };
    const providedCode = (updates.moderatorCode || "").trim();
    delete updates.moderatorCode;
    delete updates.isModerator;

    // determines if code passed in is equal to moderator code, and sets isModerator accordingly
    if (providedCode) {
      if (!process.env.MODERATOR_CODE) {
        return res.status(500).json({ success: false, message: "Moderator code not configured" });
      }
      if (providedCode !== process.env.MODERATOR_CODE) {
        return res.status(400).json({ success: false, message: "Invalid moderator code" });
      }
      updates.isModerator = true;
    }

    const updatedUser = await User.findByIdAndUpdate(targetUserId, updates, { new: true, runValidators: true }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Failed to update user", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// retrieves current user 
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

 export const getLearningLanguage = async (req, res) => {
   try {
     if (!req.userId) return res.status(401).json({ success: false, message: "Unauthorized" });
 
     const user = await User.findById(req.userId).select("language");
     if (!user) return res.status(404).json({ success: false, message: "User not found" });
 
     // Requirement: legacy accounts default to Spanish
     if (!user.language) {
       return res.status(200).json({
         success: true,
         data: {
           languageName: "Spanish",
           langCode: "es"
         }
       });
     }
 
     const langCode = mapUserLanguageToDictCode(user.language);
     const languageName = mapDictCodeToLanguageName(langCode) || user.language;
 
     return res.status(200).json({
       success: true,
       data: {
         languageName,
         langCode
       }
     });
   } catch (error) {
     return res.status(500).json({ success: false, message: "Server Error" });
   }
 };
