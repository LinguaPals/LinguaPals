import  User from '../models/UserModel.js';

// update function to update user paramaters
export const updateUser = async (req, res) => {
    try {
        const updates = req.body;

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        
        return  res.status(200).json({success: true, data: updatedUser});

    } catch(error) {
        console.error("Error: ", error.message);
        return res.status(500).json({success: false, message: "Server Error"});
    }
}