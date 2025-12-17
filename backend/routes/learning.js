import express from "express";
import { 
  getNextItem, 
  submitAnswer, 
  getProgress, 
  getModes 
} from "../services/learningService.js";

const router = express.Router();

// ============================================================================
// GET /api/learn/next - Get next learning item
// ============================================================================

router.get("/next", async (req, res) => {
  try {
    const userId = req.userId; // From requireAuth middleware
    const { 
      lang, 
      mode, 
      levelId, 
      ballId, 
      activityTypes, 
      direction, 
      difficulty,
      includeDetails 
    } = req.query;
    
    // Validate required parameters
    if (!lang) {
      return res.status(400).json({
        error: "MISSING_LANG",
        message: "Query parameter 'lang' is required"
      });
    }
    
    if (!mode) {
      return res.status(400).json({
        error: "MISSING_MODE",
        message: "Query parameter 'mode' is required"
      });
    }
    
    // Validate mode-specific parameters
    if (mode === "level" && !levelId) {
      return res.status(400).json({
        error: "MISSING_LEVEL_ID",
        message: "Query parameter 'levelId' is required for level mode"
      });
    }
    
    if (mode === "ball" && !ballId) {
      return res.status(400).json({
        error: "MISSING_BALL_ID",
        message: "Query parameter 'ballId' is required for ball mode"
      });
    }
    
    // Parse activityTypes (comma-separated)
    const allowedTypes = activityTypes ? activityTypes.split(",").map(t => t.trim()) : undefined;
    
    // Parse includeDetails
    const includeDetailsBool = includeDetails === "true";
    
    // Parse IDs as integers
    const parsedLevelId = levelId ? parseInt(levelId, 10) : undefined;
    const parsedBallId = ballId ? parseInt(ballId, 10) : undefined;
    
    // Call service
    const data = await getNextItem({
      userId,
      langCode: lang,
      mode,
      levelId: parsedLevelId,
      ballId: parsedBallId,
      activityTypes: allowedTypes,
      direction,
      difficulty,
      includeDetails: includeDetailsBool
    });
    
    // Check if this is an error state vs. legitimate "done"
    if (data.done && data.error) {
      return res.status(400).json({
        error: "INVALID_MODE_OR_SCOPE",
        message: data.error
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error("Error in GET /api/learn/next:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Server error occurred while getting next item"
    });
  }
});

// ============================================================================
// POST /api/learn/answer - Submit an answer
// ============================================================================

router.post("/answer", async (req, res) => {
  try {
    const userId = req.userId; // From requireAuth middleware
    const { 
      lang, 
      wordId, 
      activityType, 
      difficulty, 
      result, 
      misspellOverride 
    } = req.body;
    
    // Validate required parameters
    if (!lang) {
      return res.status(400).json({
        error: "MISSING_LANG",
        message: "Body parameter 'lang' is required"
      });
    }
    
    if (!wordId && wordId !== 0) {
      return res.status(400).json({
        error: "MISSING_WORD_ID",
        message: "Body parameter 'wordId' is required"
      });
    }
    
    if (!activityType) {
      return res.status(400).json({
        error: "MISSING_ACTIVITY_TYPE",
        message: "Body parameter 'activityType' is required"
      });
    }
    
    if (!difficulty) {
      return res.status(400).json({
        error: "MISSING_DIFFICULTY",
        message: "Body parameter 'difficulty' is required"
      });
    }
    
    if (!result) {
      return res.status(400).json({
        error: "MISSING_RESULT",
        message: "Body parameter 'result' is required (correct or wrong)"
      });
    }
    
    // Validate result value
    if (result !== "correct" && result !== "wrong") {
      return res.status(400).json({
        error: "INVALID_RESULT",
        message: "Body parameter 'result' must be 'correct' or 'wrong'"
      });
    }
    
    // Call service
    const data = await submitAnswer({
      userId,
      langCode: lang,
      wordId: parseInt(wordId, 10),
      activityType,
      difficulty,
      result,
      misspellOverride: !!misspellOverride
    });
    
    return res.status(200).json({
      success: true,
      ...data
    });
    
  } catch (error) {
    console.error("Error in POST /api/learn/answer:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Server error occurred while submitting answer"
    });
  }
});

// ============================================================================
// GET /api/learn/progress - Get learning progress summary
// ============================================================================

router.get("/progress", async (req, res) => {
  try {
    const userId = req.userId; // From requireAuth middleware
    const { lang } = req.query;
    
    // Validate required parameters
    if (!lang) {
      return res.status(400).json({
        error: "MISSING_LANG",
        message: "Query parameter 'lang' is required"
      });
    }
    
    // Call service
    const data = await getProgress({
      userId,
      langCode: lang
    });
    
    return res.status(200).json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error("Error in GET /api/learn/progress:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Server error occurred while getting progress"
    });
  }
});

// ============================================================================
// GET /api/learn/modes - Get available learning modes
// ============================================================================

router.get("/modes", async (req, res) => {
  try {
    const userId = req.userId; // From requireAuth middleware
    const { lang } = req.query;
    
    // Validate required parameters
    if (!lang) {
      return res.status(400).json({
        error: "MISSING_LANG",
        message: "Query parameter 'lang' is required"
      });
    }
    
    // Call service
    const data = await getModes({
      userId,
      langCode: lang
    });
    
    return res.status(200).json({
      success: true,
      data
    });
    
  } catch (error) {
    console.error("Error in GET /api/learn/modes:", error);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Server error occurred while getting modes"
    });
  }
});

export default router;
