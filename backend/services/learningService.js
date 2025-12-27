import LanguageProfile from "../models/languageProfileModel.js";
import User from "../models/userModel.js";

import { 
  dictById, 
  ballsById, 
  levelsById, 
  wordToBalls, 
  ballToLevel,
  untranslatablesByLang 
} from "../justLanguage/core/index.js";

import { 
  getRank,
  computeScoreDelta,
  applyMisspellOverride,
  buildRankBuckets,
  computeEffectiveWeights,
  sampleFromBuckets,
  updateAggregatesForWord,
  checkUnlocks,
  ensureWordStat,
  randomChoice
} from "../utils/learning/algorithmHelpers.js";

import {
  chooseActivityType,
  chooseDirection,
  buildMCQuestion,
  buildFITBQuestion,
  buildFlashcardQuestion
} from "../utils/learning/questionBuilder.js";

import { mapUserLanguageToDictCode } from "../utils/learning/languageMapping.js";

import { FLASHCARD_CAP } from "../config/learningConfig.js";

// ============================================================================
// PROFILE INITIALIZATION
// ============================================================================

/**
 * Initialize aggregates for a new language profile
 * Computes initial ball/level stats with untranslatables counted as 100
 * @param {Object} profile - LanguageProfile document
 * @param {string} langCode - Target language code
 */
function initAggregatesForNewProfile(profile, langCode) {
  const untranslatables = untranslatablesByLang[langCode] || new Set();
  
  // Initialize all balls
  for (const [ballId, ball] of ballsById.entries()) {
    let wordCount = 0;
    let sumScore = 0;
    
    for (const wordObj of ball.words) {
      wordCount++;
      // Untranslatables start at 100
      if (untranslatables.has(wordObj.id)) {
        sumScore += 100;
      }
    }
    
    profile.balls.set(String(ballId), {
      wordCount,
      sumScore,
      avgScore: wordCount > 0 ? sumScore / wordCount : 0,
      unlocked: false,
      firstUnlockedAt: null
    });
  }
  
  // Initialize all levels
  for (const [levelId, level] of levelsById.entries()) {
    let wordCount = 0;
    let sumScore = 0;
    
    for (const ballObj of level.balls) {
      const ballStat = profile.balls.get(String(ballObj.ballId));
      if (ballStat) {
        wordCount += ballStat.wordCount;
        sumScore += ballStat.sumScore;
      }
    }
    
    profile.levels.set(String(levelId), {
      wordCount,
      sumScore,
      avgScore: wordCount > 0 ? sumScore / wordCount : 0,
      unlocked: false,
      completionTimestamp: null
    });
  }
  
  // Unlock Level 1
  const sortedLevels = Array.from(levelsById.values()).sort((a, b) => a.levelId - b.levelId);
  if (sortedLevels.length > 0) {
    const firstLevel = sortedLevels[0];
    const firstLevelStat = profile.levels.get(String(firstLevel.levelId));
    if (firstLevelStat) {
      firstLevelStat.unlocked = true;
      
      // Unlock first ball of Level 1
      if (firstLevel.balls.length > 0) {
        const firstBallId = firstLevel.balls[0].ballId;
        const firstBallStat = profile.balls.get(String(firstBallId));
        if (firstBallStat) {
          firstBallStat.unlocked = true;
          firstBallStat.firstUnlockedAt = new Date();
        }
      }
    }
  }
  
  console.log(`Initialized profile for user ${profile.userId}, lang ${langCode}`);
}

/**
 * Get or create a language profile for a user
 * @param {string} userId - User ID
 * @param {string} langCode - Target language code
 * @returns {Promise<Object>} - LanguageProfile document
 */
export async function getOrCreateLanguageProfile(userId, langCode) {
  let profile = await LanguageProfile.findOne({ userId, langCode });
  
  if (!profile) {
    profile = new LanguageProfile({ userId, langCode });
    initAggregatesForNewProfile(profile, langCode);
    
    try {
      await profile.save();
      console.log(`Created new profile for user ${userId}, lang ${langCode}`);
    } catch (error) {
      // Handle race condition: another request created the profile
      if (error.code === 11000) {
        console.log(`Profile already exists (race condition), fetching for user ${userId}, lang ${langCode}`);
        profile = await LanguageProfile.findOne({ userId, langCode });
        if (!profile) {
          throw new Error("Failed to fetch profile after duplicate key error");
        }
      } else {
        throw error; // Re-throw other errors
      }
    }
  }
  
  return profile;
}

// ============================================================================
// CANDIDATE SELECTION HELPERS
// ============================================================================

/**
 * Get candidate word IDs based on mode and scope
 * @param {Object} params
 * @param {Object} params.profile - LanguageProfile document
 * @param {string} params.langCode - Target language code
 * @param {string} params.mode - "model", "level", "ball", or "masteredReview"
 * @param {number} params.levelId - Level ID (for level mode)
 * @param {number} params.ballId - Ball ID (for ball mode)
 * @returns {number[]} - Array of candidate word IDs
 */
function getCandidatesForMode({ profile, langCode, mode, levelId, ballId }) {
  const candidates = [];
  
  if (mode === "masteredReview") {
    // Return words from masteredReview list
    return [...profile.masteredReview];
  }
  
  if (mode === "ball") {
    // Single ball mode
    const ball = ballsById.get(ballId);
    if (!ball) {
      throw new Error(`Ball ${ballId} not found`);
    }
    
    // Check if ball is unlocked
    const ballStat = profile.balls.get(String(ballId));
    if (!ballStat || !ballStat.unlocked) {
      throw new Error(`Ball ${ballId} is not unlocked`);
    }
    
    return ball.words.map(w => w.id);
  }
  
  if (mode === "level") {
    // Single level mode - all unlocked balls in this level
    const level = levelsById.get(levelId);
    if (!level) {
      throw new Error(`Level ${levelId} not found`);
    }
    
    // Check if level is unlocked
    const levelStat = profile.levels.get(String(levelId));
    if (!levelStat || !levelStat.unlocked) {
      throw new Error(`Level ${levelId} is not unlocked`);
    }
    
    for (const ballObj of level.balls) {
      const ballStat = profile.balls.get(String(ballObj.ballId));
      if (ballStat && ballStat.unlocked) {
        const ball = ballsById.get(ballObj.ballId);
        if (ball) {
          candidates.push(...ball.words.map(w => w.id));
        }
      }
    }
    
    return candidates;
  }
  
  if (mode === "model") {
    // All unlocked balls across all unlocked levels
    for (const [levelId, level] of levelsById.entries()) {
      const levelStat = profile.levels.get(String(levelId));
      if (levelStat && levelStat.unlocked) {
        for (const ballObj of level.balls) {
          const ballStat = profile.balls.get(String(ballObj.ballId));
          if (ballStat && ballStat.unlocked) {
            const ball = ballsById.get(ballObj.ballId);
            if (ball) {
              candidates.push(...ball.words.map(w => w.id));
            }
          }
        }
      }
    }
    
    return candidates;
  }
  
  throw new Error(`Invalid mode: ${mode}`);
}

/**
 * Get primary ball ID for a word (first ball containing it)
 * @param {number} wordId - Word ID
 * @returns {number|null} - Ball ID or null
 */
function getPrimaryBallId(wordId) {
  const ballIds = wordToBalls.get(wordId);
  return ballIds && ballIds.length > 0 ? ballIds[0] : null;
}

/**
 * Get level ID for a word (via its primary ball)
 * @param {number} wordId - Word ID
 * @returns {number|null} - Level ID or null
 */
function getLevelForWord(wordId) {
  const ballId = getPrimaryBallId(wordId);
  return ballId ? ballToLevel.get(ballId) || null : null;
}

// ============================================================================
// GET NEXT ITEM (MAIN SELECTION LOGIC)
// ============================================================================

/**
 * Get next learning item for user
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.langCode - Target language code
 * @param {string} params.mode - Selection mode
 * @param {number} params.levelId - Level ID (for level mode)
 * @param {number} params.ballId - Ball ID (for ball mode)
 * @param {string[]} params.activityTypes - Allowed activity types
 * @param {string} params.direction - Direction preference
 * @param {string} params.difficulty - Difficulty (for UI consistency)
 * @param {boolean} params.includeDetails - Include word details
 * @returns {Promise<Object>} - Question payload or { done: true }
 */
export async function getNextItem(params) {
  const { 
    userId, 
    langCode, 
    mode, 
    levelId, 
    ballId, 
    activityTypes, 
    direction, 
    difficulty,
    includeDetails = false 
  } = params;
  
  // Get or create profile
  const profile = await getOrCreateLanguageProfile(userId, langCode);
  
  // Get user to determine native language
  const user = await User.findById(userId);
  let nativeLangCode = mapUserLanguageToDictCode(user?.language);

  // Validate native language has a dictionary
  if (!dictById[nativeLangCode]) {
    console.error(`Native language ${nativeLangCode} not found in dictionaries, defaulting to English`);
    nativeLangCode = "en";
  }
  
  // Get candidate word IDs based on mode
  let candidateWordIds;
  try {
    candidateWordIds = getCandidatesForMode({ 
      profile, 
      langCode, 
      mode, 
      levelId, 
      ballId 
    });
  } catch (error) {
    return { 
      done: true, 
      error: error.message 
    };
  }
  
  if (candidateWordIds.length === 0) {
    return { done: true };
  }
  
  // Build rank buckets (filters out untranslatables)
  const buckets = buildRankBuckets({ 
    candidateWordIds, 
    profile, 
    langCode 
  });
  
  // Check if all buckets are empty
  const allEmpty = Object.values(buckets).every(b => b.length === 0);
  if (allEmpty) {
    return { done: true };
  }
  
  // Compute effective weights and sample word
  const weights = computeEffectiveWeights(buckets);
  const sampled = sampleFromBuckets(buckets, weights);
  
  if (!sampled) {
    return { done: true };
  }
  
  const wordId = sampled.wordId;
  
  // Choose activity type and direction
  const chosenType = chooseActivityType(activityTypes);
  const chosenDirection = chooseDirection(direction);
  
  // Build question based on activity type
  let question;
  try {
    if (chosenType === "MC") {
      question = buildMCQuestion({ 
        wordId, 
        nativeLangCode, 
        targetLangCode: langCode, 
        direction: chosenDirection, 
        includeDetails 
      });
    } else if (chosenType === "FITB") {
      question = buildFITBQuestion({ 
        wordId, 
        nativeLangCode, 
        targetLangCode: langCode, 
        direction: chosenDirection, 
        includeDetails 
      });
    } else if (chosenType === "Flashcard") {
      question = buildFlashcardQuestion({ 
        wordId, 
        nativeLangCode, 
        targetLangCode: langCode, 
        direction: chosenDirection, 
        includeDetails 
      });
    } else {
      // Fallback to MC
      question = buildMCQuestion({ 
        wordId, 
        nativeLangCode, 
        targetLangCode: langCode, 
        direction: chosenDirection, 
        includeDetails 
      });
    }
  } catch (error) {
    console.error("Error building question:", error);
    return { 
      done: true, 
      error: "Failed to build question" 
    };
  }
  
  // Add ball and level metadata
  const primaryBallId = getPrimaryBallId(wordId);
  const primaryLevelId = getLevelForWord(wordId);
  
  return {
    done: false,
    ...question,
    ballId: primaryBallId,
    levelId: primaryLevelId,
    difficulty: difficulty || "medium" // Echo difficulty if provided
  };
}

// ============================================================================
// MASTERED REVIEW HELPERS
// ============================================================================

/**
 * Add word to masteredReview list
 * @param {Object} profile - LanguageProfile document
 * @param {number} wordId - Word ID
 */
function addToMasteredReview(profile, wordId) {
  if (!profile.masteredReview.includes(wordId)) {
    profile.masteredReview.push(wordId);
  }
}

/**
 * Remove word from masteredReview list
 * @param {Object} profile - LanguageProfile document
 * @param {number} wordId - Word ID
 */
function removeFromMasteredReview(profile, wordId) {
  const index = profile.masteredReview.indexOf(wordId);
  if (index > -1) {
    profile.masteredReview.splice(index, 1);
  }
}

/**
 * Check if word is in masteredReview list
 * @param {Object} profile - LanguageProfile document
 * @param {number} wordId - Word ID
 * @returns {boolean}
 */
function isInMasteredReview(profile, wordId) {
  return profile.masteredReview.includes(wordId);
}

// ============================================================================
// ANSWER RESPONSE BUILDER
// ============================================================================

/**
 * Build answer response with updated stats
 * @param {Object} profile - LanguageProfile document
 * @param {number} wordId - Word ID that was answered
 * @param {Array} unlockEvents - Unlock events
 * @returns {Object} - Response object
 */
function buildAnswerResponse(profile, wordId, unlockEvents) {
  const wordKey = String(wordId);
  const wordStat = profile.wordStats.get(wordKey);
  
  // Get affected balls and levels
  const affectedBallIds = wordToBalls.get(wordId) || [];
  const balls = affectedBallIds.map(ballId => {
    const ballStat = profile.balls.get(String(ballId));
    return {
      ballId,
      avgScore: ballStat ? Math.round(ballStat.avgScore * 100) / 100 : 0,
      unlocked: ballStat ? ballStat.unlocked : false
    };
  });
  
  const affectedLevelIds = new Set();
  for (const ballId of affectedBallIds) {
    const levelId = ballToLevel.get(ballId);
    if (levelId != null) {
      affectedLevelIds.add(levelId);
    }
  }
  
  const levels = Array.from(affectedLevelIds).map(levelId => {
    const levelStat = profile.levels.get(String(levelId));
    return {
      levelId,
      avgScore: levelStat ? Math.round(levelStat.avgScore * 100) / 100 : 0,
      unlocked: levelStat ? levelStat.unlocked : false
    };
  });
  
  return {
    word: {
      wordId,
      score: wordStat ? wordStat.score : 0,
      attempts: wordStat ? wordStat.attempts : 0,
      correct: wordStat ? wordStat.correct : 0
    },
    balls,
    levels,
    unlockEvents
  };
}

// ============================================================================
// SUBMIT ANSWER (MAIN SCORING LOGIC)
// ============================================================================

/**
 * Submit an answer and update progress
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.langCode - Target language code
 * @param {number} params.wordId - Word ID answered
 * @param {string} params.activityType - Activity type
 * @param {string} params.difficulty - Difficulty level
 * @param {string} params.result - "correct" or "wrong"
 * @param {boolean} params.misspellOverride - Whether to apply misspell override
 * @returns {Promise<Object>} - Response with updated stats
 */
export async function submitAnswer(params) {
  const { 
    userId, 
    langCode, 
    wordId, 
    activityType, 
    difficulty, 
    result, 
    misspellOverride = false 
  } = params;
  
  // Get profile
  const profile = await getOrCreateLanguageProfile(userId, langCode);
  
  // Check if word is untranslatable (should never happen, but safety check)
  const untranslatables = untranslatablesByLang[langCode] || new Set();
  if (untranslatables.has(wordId)) {
    // No-op for untranslatables, just return current state
    return buildAnswerResponse(profile, wordId, []);
  }
  
  // Ensure word stat exists
  const wordStat = ensureWordStat(profile, wordId);
  
  // Check if flashcard is capped
  const isFlashcard = activityType === "Flashcard";
  const isFlashcardCapped = isFlashcard && wordStat.flashcardGain >= FLASHCARD_CAP;
  
  // Compute base score delta
  const baseDelta = computeScoreDelta({
    activityType,
    difficulty,
    result,
    currentScore: wordStat.score,
    isFlashcardCapped
  });
  
  // Apply misspell override if needed
  let finalDelta = baseDelta;
  if (result === "wrong" && misspellOverride) {
    const correctDelta = computeScoreDelta({
      activityType,
      difficulty,
      result: "correct",
      currentScore: wordStat.score,
      isFlashcardCapped
    });
    finalDelta = applyMisspellOverride(baseDelta, correctDelta);
  }
  
  // Store old score for mastered clamp logic
  const oldScore = wordStat.score;
  
  // Compute new score with clamping
  let newScore = oldScore + finalDelta;
  if (newScore < 0) newScore = 0;
  if (newScore > 100) newScore = 100;
  
  // Mastered clamp: if already at 100, score doesn't change
  if (oldScore === 100) {
    newScore = 100;
    
    // Add to masteredReview if answered wrong
    if (result === "wrong") {
      addToMasteredReview(profile, wordId);
    }
  } else {
    // Normal score update
    wordStat.score = newScore;
  }
  
  // Update flashcard gain
  if (isFlashcard && result === "correct" && !isFlashcardCapped) {
    wordStat.flashcardGain = Math.min(FLASHCARD_CAP, wordStat.flashcardGain + 1);
  }
  
  // Update attempts and correct count
  wordStat.attempts += 1;
  if (result === "correct" || (result === "wrong" && misspellOverride)) {
    wordStat.correct += 1;
  }
  
  // Update lastSeenAt
  wordStat.lastSeenAt = new Date();
  
  // Handle masteredReview add/remove
  if (oldScore === 100 && result === "wrong") {
    addToMasteredReview(profile, wordId);
  } else if (isInMasteredReview(profile, wordId) && (result === "correct" || misspellOverride)) {
    removeFromMasteredReview(profile, wordId);
  }
  
  // Update aggregates (only if score actually changed)
  const effectiveDelta = newScore - oldScore;
  if (effectiveDelta !== 0) {
    updateAggregatesForWord({ 
      wordId, 
      scoreDelta: effectiveDelta, 
      profile, 
      langCode 
    });
  }
  
  // Check for unlocks
  const unlockEvents = checkUnlocks(profile, langCode);
  
  // Save profile
  await profile.save();
  
  // Build and return response
  return buildAnswerResponse(profile, wordId, unlockEvents);
}

// ============================================================================
// GET PROGRESS
// ============================================================================

/**
 * Get learning progress summary for user
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.langCode - Target language code
 * @returns {Promise<Object>} - Progress summary
 */
export async function getProgress(params) {
  const { userId, langCode } = params;
  
  const profile = await getOrCreateLanguageProfile(userId, langCode);
  
  // Count mastered words (score = 100)
  let masteredCount = 0;
  for (const [wordKey, stat] of profile.wordStats.entries()) {
    if (stat.score === 100) {
      masteredCount++;
    }
  }
  
  // Build level summaries
  const levels = [];
  for (const [levelKey, levelStat] of profile.levels.entries()) {
    const levelId = parseInt(levelKey, 10);
    const level = levelsById.get(levelId);
    
    if (level) {
      levels.push({
        levelId,
        levelName: level.levelName,
        unlocked: levelStat.unlocked,
        avgScore: Math.round(levelStat.avgScore * 100) / 100,
        wordCount: levelStat.wordCount,
        completionTimestamp: levelStat.completionTimestamp
      });
    }
  }
  
  // Build ball summaries
  const balls = [];
  for (const [ballKey, ballStat] of profile.balls.entries()) {
    const ballId = parseInt(ballKey, 10);
    const ball = ballsById.get(ballId);
    
    if (ball && ballStat.unlocked) {
      balls.push({
        ballId,
        ballName: ball.ballName,
        unlocked: ballStat.unlocked,
        avgScore: Math.round(ballStat.avgScore * 100) / 100,
        wordCount: ballStat.wordCount,
        firstUnlockedAt: ballStat.firstUnlockedAt
      });
    }
  }
  
  return {
    langCode,
    masteredCount,
    masteredReviewCount: profile.masteredReview.length,
    streakDays: profile.streakDays,
    achievements: profile.achievements,
    levels: levels.sort((a, b) => a.levelId - b.levelId),
    balls: balls.sort((a, b) => a.ballId - b.ballId)
  };
}

// ============================================================================
// GET MODES
// ============================================================================

/**
 * Get available learning modes and recommendations
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.langCode - Target language code
 * @returns {Promise<Object>} - Available modes and recommendations
 */
export async function getModes(params) {
  const { userId, langCode } = params;
  
  const profile = await getOrCreateLanguageProfile(userId, langCode);
  
  // Get unlocked levels with details
  const unlockedLevels = [];
  for (const [levelKey, levelStat] of profile.levels.entries()) {
    if (levelStat.unlocked) {
      const levelId = parseInt(levelKey, 10);
      const level = levelsById.get(levelId);
      
      if (level) {
        unlockedLevels.push({
          levelId,
          levelName: level.levelName,
          avgScore: Math.round(levelStat.avgScore * 100) / 100,
          progressPercent: Math.round(levelStat.avgScore)
        });
      }
    }
  }
  
  // Get unlocked balls with details
  const unlockedBalls = [];
  for (const [ballKey, ballStat] of profile.balls.entries()) {
    if (ballStat.unlocked) {
      const ballId = parseInt(ballKey, 10);
      const ball = ballsById.get(ballId);
      
      if (ball) {
        unlockedBalls.push({
          ballId,
          ballName: ball.ballName,
          avgScore: Math.round(ballStat.avgScore * 100) / 100,
          progressPercent: Math.round(ballStat.avgScore)
        });
      }
    }
  }
  
  // Find recommended mode (lowest progress unlocked ball)
  let recommendedMode = null;
  if (unlockedBalls.length > 0) {
    const lowestBall = unlockedBalls.reduce((min, ball) => 
      ball.avgScore < min.avgScore ? ball : min
    );
    
    recommendedMode = {
      type: "ball",
      ballId: lowestBall.ballId,
      ballName: lowestBall.ballName,
      reason: "Lowest progress"
    };
  }
  
  return {
    langCode,
    unlockedLevels: unlockedLevels.sort((a, b) => a.levelId - b.levelId),
    unlockedBalls: unlockedBalls.sort((a, b) => a.ballId - b.ballId),
    masteredReviewAvailable: profile.masteredReview.length > 0,
    masteredReviewCount: profile.masteredReview.length,
    recommendedMode
  };
}
