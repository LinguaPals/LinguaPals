import { 
  RANKS, 
  BUCKET_WEIGHTS, 
  SCORING, 
  FLASHCARD_CAP, 
  MC_TAPER_THRESHOLD,
  MISSPELL_RECLAIM_FACTOR,
  UNLOCK_THRESHOLDS
} from "../../config/learningConfig.js";

import { 
  untranslatablesByLang, 
  wordToBalls, 
  ballToLevel,
  ballsById,
  levelsById
} from "../../justLanguage/core/index.js";

// ============================================================================
// RANK DETERMINATION
// ============================================================================

/**
 * Get rank name based on score
 * @param {number} score - Word score (0-100)
 * @returns {string} - Rank name (NEW, LEARNING, etc.)
 */
export function getRank(score) {
  for (const rank of RANKS) {
    if (score >= rank.min && score <= rank.max) {
      return rank.name;
    }
  }
  return "NEW"; // Fallback
}

// ============================================================================
// SCORE DELTA COMPUTATION
// ============================================================================

/**
 * Compute score delta based on activity type, difficulty, and result
 * @param {Object} params
 * @param {string} params.activityType - "MC", "FITB", or "Flashcard"
 * @param {string} params.difficulty - "easy", "medium", or "hard"
 * @param {string} params.result - "correct" or "wrong"
 * @param {number} params.currentScore - Current word score
 * @param {boolean} params.isFlashcardCapped - Whether flashcard cap is reached
 * @returns {number} - Score delta
 */
export function computeScoreDelta({ 
  activityType, 
  difficulty, 
  result, 
  currentScore, 
  isFlashcardCapped 
}) {
  // Flashcard special handling
  if (activityType === "Flashcard") {
    if (result === "correct" && !isFlashcardCapped) {
      return SCORING.Flashcard.correct;
    }
    return 0; // Wrong or capped
  }
  
  // Get scoring table for activity type
  const activityScoring = SCORING[activityType];
  if (!activityScoring || !activityScoring[difficulty]) {
    console.error(`Invalid activity type or difficulty: ${activityType} ${difficulty}`);
    return 0;
  }
  
  const difficultyScoring = activityScoring[difficulty];
  
  // Handle correct answers
  if (result === "correct") {
    let correctDelta = difficultyScoring.correct;
    
    // MC Easy taper: reduce delta after threshold
    if (activityType === "MC" && difficulty === "easy" && currentScore > MC_TAPER_THRESHOLD) {
      correctDelta = 1; // Reduced from 2 to 1
    }
    
    return correctDelta;
  }
  
  // Handle wrong answers
  if (result === "wrong") {
    return difficultyScoring.wrong;
  }
  
  return 0;
}

/**
 * Apply misspell override: wrong delta + partial correct delta
 * @param {number} wrongDelta - The wrong answer delta (negative)
 * @param {number} correctDelta - The correct answer delta (positive)
 * @returns {number} - Net delta after reclaim
 */
export function applyMisspellOverride(wrongDelta, correctDelta) {
  const reclaim = MISSPELL_RECLAIM_FACTOR * correctDelta;
  return wrongDelta + reclaim;
}

// ============================================================================
// BUCKET BUILDING & SELECTION
// ============================================================================

/**
 * Build rank buckets from candidate word IDs
 * @param {Object} params
 * @param {number[]} params.candidateWordIds - Word IDs in scope
 * @param {Object} params.profile - LanguageProfile document
 * @param {string} params.langCode - Target language code
 * @returns {Object} - { NEW: [], LEARNING: [], ... }
 */
export function buildRankBuckets({ candidateWordIds, profile, langCode }) {
  const buckets = {
    NEW: [],
    LEARNING: [],
    PRACTICING: [],
    MASTERING: [],
    MASTERED: []
  };
  
  const untranslatables = untranslatablesByLang[langCode] || new Set();
  
  for (const wordId of candidateWordIds) {
    // Skip untranslatables (never shown to user)
    if (untranslatables.has(wordId)) {
      continue;
    }
    
    // Get word stat (may not exist if never seen)
    const wordKey = String(wordId);
    const stat = profile.wordStats.get(wordKey);
    const score = stat ? stat.score : 0; // Default to 0 if never seen
    
    // Determine rank and add to bucket
    const rank = getRank(score);
    buckets[rank].push(wordId);
  }
  
  return buckets;
}

/**
 * Compute effective weights by dropping empty buckets and normalizing
 * @param {Object} buckets - Rank buckets
 * @returns {Object} - Normalized weights { NEW: 0.5, LEARNING: 0.2, ... }
 */
export function computeEffectiveWeights(buckets) {
  const weights = {};
  let total = 0;
  
  // Only include weights for non-empty buckets
  for (const [rank, weight] of Object.entries(BUCKET_WEIGHTS)) {
    if (buckets[rank] && buckets[rank].length > 0) {
      weights[rank] = weight;
      total += weight;
    }
  }
  
  // Normalize to probabilities
  const normalized = {};
  for (const [rank, weight] of Object.entries(weights)) {
    normalized[rank] = weight / total;
  }
  
  return normalized;
}

/**
 * Sample a word from buckets using weighted random selection
 * @param {Object} buckets - Rank buckets
 * @param {Object} weights - Normalized weights
 * @returns {Object|null} - { bucket: "NEW", wordId: 1823 } or null if empty
 */
export function sampleFromBuckets(buckets, weights) {
  // Check if all buckets are empty
  const allEmpty = Object.values(buckets).every(b => b.length === 0);
  if (allEmpty) {
    return null;
  }
  
  // Weighted random selection of rank
  const selectedRank = weightedRandomChoice(weights);
  if (!selectedRank) {
    return null;
  }
  
  // Uniform random selection from that bucket
  const bucket = buckets[selectedRank];
  if (!bucket || bucket.length === 0) {
    return null;
  }
  
  const wordId = randomChoice(bucket);
  
  return { bucket: selectedRank, wordId };
}

// ============================================================================
// AGGREGATE UPDATES
// ============================================================================

/**
 * Update ball and level aggregates after a score change
 * @param {Object} params
 * @param {number} params.wordId - Word ID that changed
 * @param {number} params.scoreDelta - Change in score
 * @param {Object} params.profile - LanguageProfile document
 * @param {string} params.langCode - Target language code
 */
export function updateAggregatesForWord({ wordId, scoreDelta, profile, langCode }) {
  // Get all balls containing this word
  const ballIds = wordToBalls.get(wordId) || [];
  
  for (const ballId of ballIds) {
    const ballKey = String(ballId);
    
    // Ensure ball stat exists
    if (!profile.balls.has(ballKey)) {
      ensureBallStat(profile, ballId, langCode);
    }
    
    const ballStat = profile.balls.get(ballKey);
    
    // Guard against missing stat (shouldn't happen but safety)
    if (!ballStat) {
      console.error(`Ball stat ${ballId} not found after ensure, skipping aggregate update`);
      continue;
    }
    
    // Update ball aggregates
    ballStat.sumScore += scoreDelta;
    ballStat.avgScore = ballStat.wordCount > 0 
      ? ballStat.sumScore / ballStat.wordCount 
      : 0;
    
    // Update parent level aggregates
    const levelId = ballToLevel.get(ballId);
    if (levelId != null) {
      const levelKey = String(levelId);
      
      // Ensure level stat exists
      if (!profile.levels.has(levelKey)) {
        ensureLevelStat(profile, levelId, langCode);
      }
      
      const levelStat = profile.levels.get(levelKey);
      
      // Guard against missing stat
      if (!levelStat) {
        console.error(`Level stat ${levelId} not found after ensure, skipping aggregate update`);
        continue;
      }
      
      // Update level aggregates
      levelStat.sumScore += scoreDelta;
      levelStat.avgScore = levelStat.wordCount > 0 
        ? levelStat.sumScore / levelStat.wordCount 
        : 0;
    }
  }
}

// ============================================================================
// UNLOCK DETECTION
// ============================================================================

/**
 * Check for ball and level unlocks based on current progress
 * @param {Object} profile - LanguageProfile document
 * @param {string} langCode - Target language code
 * @returns {Array} - Array of unlock events: [{ type: "ball", ballId: 5 }, ...]
 */
export function checkUnlocks(profile, langCode) {
  const unlockEvents = [];
  
  // Iterate through levels in order
  const sortedLevels = Array.from(levelsById.values()).sort((a, b) => a.levelId - b.levelId);
  
  for (const level of sortedLevels) {
    const levelKey = String(level.levelId);
    const levelStat = profile.levels.get(levelKey);
    
    if (!levelStat || !levelStat.unlocked) {
      continue; // Skip locked levels
    }
    
    // Get ball IDs in this level
    const ballIdsInLevel = level.balls.map(b => b.ballId);
    
    // Check ball unlock condition: all unlocked balls >= 50
    const unlockedBallsInLevel = ballIdsInLevel.filter(ballId => {
      const ballStat = profile.balls.get(String(ballId));
      return ballStat && ballStat.unlocked;
    });
    
    if (unlockedBallsInLevel.length > 0) {
      const allUnlockedMet50 = unlockedBallsInLevel.every(ballId => {
        const ballStat = profile.balls.get(String(ballId));
        return ballStat.avgScore >= UNLOCK_THRESHOLDS.BALL;
      });
      
      if (allUnlockedMet50) {
        // Find next locked ball in this level
        const nextLockedBall = ballIdsInLevel.find(ballId => {
          const ballStat = profile.balls.get(String(ballId));
          return !ballStat || !ballStat.unlocked;
        });
        
        if (nextLockedBall != null) {
          const ballKey = String(nextLockedBall);
          ensureBallStat(profile, nextLockedBall, langCode);
          const ballStat = profile.balls.get(ballKey);
          
          if (!ballStat.unlocked) {
            ballStat.unlocked = true;
            ballStat.firstUnlockedAt = new Date();
            unlockEvents.push({ type: "ball", ballId: nextLockedBall });
          }
        }
      }
    }
    
    // Check level unlock condition: all balls >= 75
    const allBallsMet75 = ballIdsInLevel.every(ballId => {
      const ballStat = profile.balls.get(String(ballId));
      return ballStat && ballStat.avgScore >= UNLOCK_THRESHOLDS.LEVEL;
    });
    
    if (allBallsMet75) {
      // Find next level
      const currentIndex = sortedLevels.findIndex(l => l.levelId === level.levelId);
      const nextLevel = sortedLevels[currentIndex + 1];
      
      if (nextLevel) {
        const nextLevelKey = String(nextLevel.levelId);
        ensureLevelStat(profile, nextLevel.levelId, langCode);
        const nextLevelStat = profile.levels.get(nextLevelKey);
        
        if (!nextLevelStat.unlocked) {
          nextLevelStat.unlocked = true;
          
          // Set completion timestamp on CURRENT level (the one that was completed)
          levelStat.completionTimestamp = new Date();
          
          unlockEvents.push({ type: "level", levelId: nextLevel.levelId });
          
          // Unlock first ball of new level
          if (nextLevel.balls.length > 0) {
            const firstBallId = nextLevel.balls[0].ballId;
            const firstBallKey = String(firstBallId);
            ensureBallStat(profile, firstBallId, langCode);
            const firstBallStat = profile.balls.get(firstBallKey);
            
            if (!firstBallStat.unlocked) {
              firstBallStat.unlocked = true;
              firstBallStat.firstUnlockedAt = new Date();
              unlockEvents.push({ type: "ball", ballId: firstBallId });
            }
          }
        }
      }
    }
  }
  
  return unlockEvents;
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Weighted random selection
 * @param {Object} weights - { key: probability, ... }
 * @returns {string|null} - Selected key or null
 */
function weightedRandomChoice(weights) {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [key, prob] of Object.entries(weights)) {
    cumulative += prob;
    if (rand < cumulative) {
      return key;
    }
  }
  
  // Fallback (shouldn't reach here if weights sum to 1)
  const keys = Object.keys(weights);
  return keys.length > 0 ? keys[0] : null;
}

/**
 * Uniform random selection from array
 * @param {Array} array
 * @returns {*} - Random element
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Fisher-Yates shuffle
 * @param {Array} array - Array to shuffle (in-place)
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Ensure word stat exists in profile
 * @param {Object} profile - LanguageProfile document
 * @param {number} wordId - Word ID
 * @returns {Object} - Word stat object
 */
export function ensureWordStat(profile, wordId) {
  const wordKey = String(wordId);
  
  if (!profile.wordStats.has(wordKey)) {
    profile.wordStats.set(wordKey, {
      score: 0,
      flashcardGain: 0,
      attempts: 0,
      correct: 0,
      lastSeenAt: null
    });
  }
  
  return profile.wordStats.get(wordKey);
}

/**
 * Ensure ball stat exists in profile
 * @param {Object} profile - LanguageProfile document
 * @param {number} ballId - Ball ID
 * @param {string} langCode - Target language code
 */
function ensureBallStat(profile, ballId, langCode) {
  const ballKey = String(ballId);
  
  if (!profile.balls.has(ballKey)) {
    const ball = ballsById.get(ballId);
    if (!ball) {
      console.error(`Ball ${ballId} not found in ballsById`);
      return;
    }
    
    const untranslatables = untranslatablesByLang[langCode] || new Set();
    let wordCount = 0;
    let sumScore = 0;
    
    // Count words and compute initial score
    for (const wordObj of ball.words) {
      wordCount++;
      if (untranslatables.has(wordObj.id)) {
        sumScore += 100; // Untranslatables count as 100
      }
    }
    
    profile.balls.set(ballKey, {
      sumScore,
      avgScore: wordCount > 0 ? sumScore / wordCount : 0,
      wordCount,
      unlocked: false,
      firstUnlockedAt: null
    });
  }
}

/**
 * Ensure level stat exists in profile
 * @param {Object} profile - LanguageProfile document
 * @param {number} levelId - Level ID
 * @param {string} langCode - Target language code
 */
function ensureLevelStat(profile, levelId, langCode) {
  const levelKey = String(levelId);
  
  if (!profile.levels.has(levelKey)) {
    const level = levelsById.get(levelId);
    if (!level) {
      console.error(`Level ${levelId} not found in levelsById`);
      return;
    }
    
    let wordCount = 0;
    let sumScore = 0;
    
    // Sum from all balls in this level
    for (const ballObj of level.balls) {
      const ballKey = String(ballObj.ballId);
      
      // Ensure ball stat exists first
      ensureBallStat(profile, ballObj.ballId, langCode);
      
      const ballStat = profile.balls.get(ballKey);
      if (ballStat) {
        wordCount += ballStat.wordCount;
        sumScore += ballStat.sumScore;
      }
    }
    
    profile.levels.set(levelKey, {
      sumScore,
      avgScore: wordCount > 0 ? sumScore / wordCount : 0,
      wordCount,
      unlocked: false,
      completionTimestamp: null
    });
  }
}