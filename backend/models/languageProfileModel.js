import mongoose from "mongoose";

// Sub-schema for per-word statistics
const wordStatSchema = new mongoose.Schema({
  score: { type: Number, default: 0, min: 0, max: 100 },
  flashcardGain: { type: Number, default: 0, min: 0 },
  attempts: { type: Number, default: 0, min: 0 },
  correct: { type: Number, default: 0, min: 0 },
  lastSeenAt: { type: Date, default: null }
}, { _id: false });

// Sub-schema for per-ball cached statistics
const ballStatSchema = new mongoose.Schema({
  sumScore: { type: Number, default: 0, min: 0 },
  avgScore: { type: Number, default: 0, min: 0, max: 100 },
  wordCount: { type: Number, default: 0, min: 0 },
  unlocked: { type: Boolean, default: false },
  firstUnlockedAt: { type: Date, default: null }
}, { _id: false });

// Sub-schema for per-level cached statistics
const levelStatSchema = new mongoose.Schema({
  sumScore: { type: Number, default: 0, min: 0 },
  avgScore: { type: Number, default: 0, min: 0, max: 100 },
  wordCount: { type: Number, default: 0, min: 0 },
  unlocked: { type: Boolean, default: false },
  completionTimestamp: { type: Date, default: null }
}, { _id: false });

// Main LanguageProfile schema
const languageProfileSchema = new mongoose.Schema({
  // User reference
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true 
  },
  
  // Target language code (e.g., "es", "fr", "de")
  langCode: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Sparse per-word statistics (only words user has seen)
  // Key: wordId (as string), Value: wordStatSchema
  wordStats: { 
    type: Map, 
    of: wordStatSchema, 
    default: () => new Map() 
  },
  
  // Cached ball progress and unlock state
  // Key: ballId (as string), Value: ballStatSchema
  balls: { 
    type: Map, 
    of: ballStatSchema, 
    default: () => new Map() 
  },
  
  // Cached level progress and unlock state
  // Key: levelId (as string), Value: levelStatSchema
  levels: { 
    type: Map, 
    of: levelStatSchema, 
    default: () => new Map() 
  },
  
  // Mastered words that were answered incorrectly (need review)
  masteredReview: { 
    type: [Number], 
    default: [] 
  },
  
  // Daily streak counter
  streakDays: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Achievement badges (non-time-based)
  achievements: { 
    type: [String], 
    default: [] 
  }
}, { 
  timestamps: true  // Adds createdAt and updatedAt
});

// Unique compound index: one profile per user per language
languageProfileSchema.index({ userId: 1, langCode: 1 }, { unique: true });

// Export model
export default mongoose.model("LanguageProfile", languageProfileSchema);