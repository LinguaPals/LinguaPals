import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    username: { type: String, required: true },
    text: { type: String, required: true },
    deliveredAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;