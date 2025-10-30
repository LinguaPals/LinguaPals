import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", default: null, index: true },
    dateId: { type: String, default: null },
    weekTag: { type: String, default: null },
    storage: {
      provider: { type: String, default: "mongo" },
      key: { type: String, default: null },
      storageId: { type: String, default: null }
    },
    media: {
      mime: { type: String, default: "video/mp4" },
      sizeBytes: { type: Number, default: 0 },
      durationSec: { type: Number, default: 0 },
      ratio: { type: String, default: "16:9" }
    },
    status: { type: String, enum: ["ready", "processing", "deleted"], default: "ready" },
    reported: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ matchId: 1, createdAt: 1 });
postSchema.index({ userId: 1, dateId: 1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
