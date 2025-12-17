// Learning algorithm configuration
// All constants for scoring, ranking, and selection

// Rank definitions with score boundaries
export const RANKS = [
  { name: "NEW", min: 0, max: 25 },
  { name: "LEARNING", min: 26, max: 50 },
  { name: "PRACTICING", min: 51, max: 75 },
  { name: "MASTERING", min: 76, max: 99 },
  { name: "MASTERED", min: 100, max: 100 }
];

// Default bucket weights for word selection
export const BUCKET_WEIGHTS = {
  NEW: 50,
  LEARNING: 20,
  PRACTICING: 15,
  MASTERING: 10,
  MASTERED: 5
};

// Flashcard scoring cap
export const FLASHCARD_CAP = 20;

// MC Easy taper threshold (reduce delta after this score)
export const MC_TAPER_THRESHOLD = 60;

// Scoring deltas by activity type and difficulty
export const SCORING = {
  MC: {
    easy: { 
      correct: 2,  // +2 normally, +1 after taper threshold
      wrong: 0 
    },
    medium: { 
      correct: 3, 
      wrong: -1 
    },
    hard: { 
      correct: 4, 
      wrong: -2 
    }
  },
  FITB: {
    easy: { 
      correct: 3, 
      wrong: 0 
    },
    medium: { 
      correct: 6, 
      wrong: -3 
    },
    hard: { 
      correct: 9, 
      wrong: -5 
    }
  },
  Flashcard: {
    correct: 1,
    wrong: 0
  }
};

// Misspell override: how much of correct delta to reclaim after wrong
export const MISSPELL_RECLAIM_FACTOR = 0.5;

// Unlock thresholds
export const UNLOCK_THRESHOLDS = {
  BALL: 50,   // Unlock next ball when current balls avg >= 50
  LEVEL: 75   // Unlock next level when all balls avg >= 75
};

// MC question configuration
export const MC_CONFIG = {
  TOTAL_CHOICES: 4,        // 1 correct + 3 distractors
  NUM_DISTRACTORS: 3
};
