import { 
  dictById, 
  ballsById, 
  levelsById,
  wordToBalls, 
  ballToLevel,
  untranslatablesByLang 
} from "../../justLanguage/core/index.js";

import { randomChoice, shuffle } from "./algorithmHelpers.js";
import { MC_CONFIG } from "../../config/learningConfig.js";

// ============================================================================
// ACTIVITY TYPE & DIRECTION SELECTION
// ============================================================================

/**
 * Choose activity type from allowed types
 * @param {string[]} allowedTypes - Array of allowed activity types
 * @returns {string} - Selected activity type
 */
export function chooseActivityType(allowedTypes) {
  if (!allowedTypes || allowedTypes.length === 0) {
    return "MC"; // Default to multiple choice
  }
  
  return randomChoice(allowedTypes);
}

/**
 * Choose direction based on parameter
 * @param {string} directionParam - "nativeToTarget", "targetToNative", or "both"
 * @returns {string} - "nativeToTarget" or "targetToNative"
 */
export function chooseDirection(directionParam) {
  if (directionParam === "nativeToTarget") {
    return "nativeToTarget";
  }
  
  if (directionParam === "targetToNative") {
    return "targetToNative";
  }
  
  if (directionParam === "both") {
    // Random 50/50 choice
    return Math.random() < 0.5 ? "nativeToTarget" : "targetToNative";
  }
  
  // Default
  return "nativeToTarget";
}

// ============================================================================
// DISTRACTOR SELECTION
// ============================================================================

/**
 * Select distractor word IDs for multiple choice questions
 * Strategy: Try same ball → same level → full dictionary
 * @param {Object} params
 * @param {number} params.wordId - Correct word ID
 * @param {string} params.targetLangCode - Target language code
 * @param {number} params.numDistractors - Number of distractors needed (default 3)
 * @returns {number[]} - Array of distractor word IDs
 */
export function selectDistractors({ wordId, targetLangCode, numDistractors = MC_CONFIG.NUM_DISTRACTORS }) {
  const targetDict = dictById[targetLangCode];
  const untranslatables = untranslatablesByLang[targetLangCode] || new Set();
  
  const candidates = new Set();
  
  // Get balls containing the correct word
  const correctBallIds = wordToBalls.get(wordId) || [];
  
  // Get level containing these balls
  const levelId = correctBallIds.length > 0 ? ballToLevel.get(correctBallIds[0]) : null;
  
  // STEP 1: Try same ball(s)
  for (const ballId of correctBallIds) {
    const ball = ballsById.get(ballId);
    if (ball) {
      for (const wordObj of ball.words) {
        const wId = wordObj.id;
        // Exclude correct answer and untranslatables
        if (wId !== wordId && !untranslatables.has(wId)) {
          candidates.add(wId);
        }
      }
    }
  }
  
  // STEP 2: If not enough, add from same level
  if (candidates.size < numDistractors && levelId != null) {
    const level = levelsById.get(levelId);
    if (level) {
      for (const ballObj of level.balls) {
        const ball = ballsById.get(ballObj.ballId);
        if (ball) {
          for (const wordObj of ball.words) {
            const wId = wordObj.id;
            if (wId !== wordId && !untranslatables.has(wId)) {
              candidates.add(wId);
            }
          }
        }
      }
    }
  }
  
  // STEP 3: If still not enough, add from entire dictionary
  if (candidates.size < numDistractors) {
    for (const wId of targetDict.keys()) {
      if (wId !== wordId && !untranslatables.has(wId)) {
        candidates.add(wId);
      }
      
      // Stop once we have enough candidates
      if (candidates.size >= numDistractors * 3) break; // Get 3x for good variety
    }
  }
  
  // Convert to array and shuffle
  const candidateArray = Array.from(candidates);
  shuffle(candidateArray);
  
  // STEP 4: Guarantee exactly numDistractors
  if (candidateArray.length >= numDistractors) {
    // We have enough - return the requested number
    return candidateArray.slice(0, numDistractors);
  } else {
    // Not enough unique distractors - pad with duplicates from what we have
    const result = [...candidateArray];
    
    // If we have at least 1 candidate, repeat from existing pool
    if (candidateArray.length > 0) {
      while (result.length < numDistractors) {
        const randomIndex = Math.floor(Math.random() * candidateArray.length);
        result.push(candidateArray[randomIndex]);
      }
    } else {
      // Extremely rare: no valid distractors at all
      // Fall back to random words from dictionary (excluding correct answer and untranslatables)
      const allValidWords = Array.from(targetDict.keys()).filter(
        wId => wId !== wordId && !untranslatables.has(wId)
      );
      
      if (allValidWords.length > 0) {
        while (result.length < numDistractors) {
          const randomIndex = Math.floor(Math.random() * allValidWords.length);
          result.push(allValidWords[randomIndex]);
        }
      } else {
        // Absolute edge case: entire dictionary is untranslatable
        // This should never happen, but log it
        console.error(`Cannot generate distractors for word ${wordId} in ${targetLangCode} - insufficient valid words`);
        // Return whatever we have
        return result;
      }
    }
    
    return result;
  }
}

// ============================================================================
// MULTIPLE CHOICE QUESTION BUILDER
// ============================================================================

/**
 * Build a multiple choice question
 * @param {Object} params
 * @param {number} params.wordId - Word ID to test
 * @param {string} params.nativeLangCode - User's native language code
 * @param {string} params.targetLangCode - Target language code
 * @param {string} params.direction - "nativeToTarget" or "targetToNative"
 * @param {boolean} params.includeDetails - Whether to include definitions, examples, etc.
 * @returns {Object} - Question payload
 */
export function buildMCQuestion({ 
  wordId, 
  nativeLangCode, 
  targetLangCode, 
  direction, 
  includeDetails = false 
}) {
  const nativeDict = dictById[nativeLangCode];
  const targetDict = dictById[targetLangCode];
  
  const nativeEntry = nativeDict.get(wordId);
  const targetEntry = targetDict.get(wordId);
  
  if (!nativeEntry || !targetEntry) {
    throw new Error(`Word ${wordId} not found in dictionaries`);
  }
  
  // Determine prompt and correct answer based on direction
  const prompt = direction === "nativeToTarget" 
    ? nativeEntry.word 
    : targetEntry.word;
  
  const correctText = direction === "nativeToTarget" 
    ? targetEntry.word 
    : nativeEntry.word;
  
  // Select distractors
  const distractorIds = selectDistractors({ 
    wordId, 
    targetLangCode: direction === "nativeToTarget" ? targetLangCode : nativeLangCode,
    numDistractors: MC_CONFIG.NUM_DISTRACTORS 
  });
  
  // Build choices array (1 correct + 3 distractors)
  const choices = [
    {
      wordId,
      text: correctText,
      isCorrect: true
    }
  ];
  
  // Add distractors
  const distractorDict = direction === "nativeToTarget" ? targetDict : nativeDict;
  for (const distractorId of distractorIds) {
    const distractorEntry = distractorDict.get(distractorId);
    if (distractorEntry && distractorEntry.word) {
      choices.push({
        wordId: distractorId,
        text: distractorEntry.word,
        isCorrect: false
      });
    }
  }
  
  // Shuffle choices
  shuffle(choices);

  // Validation: Ensure we have exactly 4 choices
  if (choices.length !== MC_CONFIG.TOTAL_CHOICES) {
    console.warn(
      `MC question for word ${wordId} has ${choices.length} choices instead of ${MC_CONFIG.TOTAL_CHOICES}. ` +
      `This should not happen after selectDistractors fix.`
    );
  }
  
  // Build base question object
  const question = {
    wordId,
    activityType: "MC",
    direction,
    prompt,
    choices,
    nativeWord: nativeEntry.word,
    targetWord: targetEntry.word
  };
  
  // Add details if requested
  if (includeDetails) {
    question.details = {
      part_of_speech: targetEntry.part_of_speech || null,
      definition: targetEntry.definition || null,
      definition_learner: targetEntry.definition_learner || null,
      examples: targetEntry.examples || [],
      synonyms: (targetEntry.synonyms || []).filter(s => s !== null),
      antonyms: (targetEntry.antonyms || []).filter(a => a !== null),
      forms: targetEntry.forms || {}
    };
  }
  
  return question;
}

// ============================================================================
// FILL-IN-THE-BLANK QUESTION BUILDER
// ============================================================================

/**
 * Build a fill-in-the-blank question
 * @param {Object} params
 * @param {number} params.wordId - Word ID to test
 * @param {string} params.nativeLangCode - User's native language code
 * @param {string} params.targetLangCode - Target language code
 * @param {string} params.direction - "nativeToTarget" or "targetToNative"
 * @param {boolean} params.includeDetails - Whether to include definitions, examples, etc.
 * @returns {Object} - Question payload
 */
export function buildFITBQuestion({ 
  wordId, 
  nativeLangCode, 
  targetLangCode, 
  direction, 
  includeDetails = false 
}) {
  const nativeDict = dictById[nativeLangCode];
  const targetDict = dictById[targetLangCode];
  
  const nativeEntry = nativeDict.get(wordId);
  const targetEntry = targetDict.get(wordId);
  
  if (!nativeEntry || !targetEntry) {
    throw new Error(`Word ${wordId} not found in dictionaries`);
  }
  
  // Determine prompt and correct answer based on direction
  const prompt = direction === "nativeToTarget" 
    ? nativeEntry.word 
    : targetEntry.word;
  
  const correctAnswer = direction === "nativeToTarget" 
    ? targetEntry.word 
    : nativeEntry.word;
  
  // Build base question object
  const question = {
    wordId,
    activityType: "FITB",
    direction,
    prompt,
    correctAnswer,
    nativeWord: nativeEntry.word,
    targetWord: targetEntry.word
  };
  
  // Add details if requested
  if (includeDetails) {
    question.details = {
      part_of_speech: targetEntry.part_of_speech || null,
      definition: targetEntry.definition || null,
      definition_learner: targetEntry.definition_learner || null,
      examples: targetEntry.examples || [],
      synonyms: (targetEntry.synonyms || []).filter(s => s !== null),
      antonyms: (targetEntry.antonyms || []).filter(a => a !== null),
      forms: targetEntry.forms || {}
    };
  }
  
  return question;
}

// ============================================================================
// FLASHCARD QUESTION BUILDER
// ============================================================================

/**
 * Build a flashcard question
 * @param {Object} params
 * @param {number} params.wordId - Word ID to test
 * @param {string} params.nativeLangCode - User's native language code
 * @param {string} params.targetLangCode - Target language code
 * @param {string} params.direction - "nativeToTarget" or "targetToNative"
 * @param {boolean} params.includeDetails - Whether to include definitions, examples, etc.
 * @returns {Object} - Question payload
 */
export function buildFlashcardQuestion({ 
  wordId, 
  nativeLangCode, 
  targetLangCode, 
  direction, 
  includeDetails = false 
}) {
  const nativeDict = dictById[nativeLangCode];
  const targetDict = dictById[targetLangCode];
  
  const nativeEntry = nativeDict.get(wordId);
  const targetEntry = targetDict.get(wordId);
  
  if (!nativeEntry || !targetEntry) {
    throw new Error(`Word ${wordId} not found in dictionaries`);
  }
  
  // Determine front and back of flashcard based on direction
  const front = direction === "nativeToTarget" 
    ? nativeEntry.word 
    : targetEntry.word;
  
  const back = direction === "nativeToTarget" 
    ? targetEntry.word 
    : nativeEntry.word;
  
  // Build base question object
  const question = {
    wordId,
    activityType: "Flashcard",
    direction,
    front,
    back,
    nativeWord: nativeEntry.word,
    targetWord: targetEntry.word
  };
  
  // Add details if requested
  if (includeDetails) {
    question.details = {
      part_of_speech: targetEntry.part_of_speech || null,
      definition: targetEntry.definition || null,
      definition_learner: targetEntry.definition_learner || null,
      examples: targetEntry.examples || [],
      synonyms: (targetEntry.synonyms || []).filter(s => s !== null),
      antonyms: (targetEntry.antonyms || []).filter(a => a !== null),
      forms: targetEntry.forms || {}
    };
  }
  
  return question;
}
