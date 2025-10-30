import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    weekTag: { type: String, required: true, index: true },
    userA: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;
