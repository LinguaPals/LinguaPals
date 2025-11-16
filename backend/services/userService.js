import User from "../models/userModel.js";

export const updateUser = async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

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
