import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { Schema } = mongoose;
const SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: false },
  googleID: {type: String, required: false, default: null },
  username: { type: String, required: false },
  language: { type: String, required: false },
  proficiency: { type: String, required: false },
  streakCount: { type: Number, default: 0 },
  videoCount: { type: Number, default: 0 },
  lastUploadDateId: { type: String, default: null },
  level: { type: Number, default: 1 },
  postedToday: { type: Boolean, required: false, default: false },
  currentMatchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match", default: null },
  canMatch: { type: Boolean, required: false, default: null },
  isMatched: { type: Boolean, required: false, default: false },
  isNewGoogle: { type: Boolean, required: false, default: false },
  canEmail: { type: Boolean, required: false, default: true },
  partnerUsername: {type: String, required: false, default: null },
  isModerator: { type: Boolean, required: false, default: false }
});

UserSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

export default mongoose.model("User", UserSchema);
