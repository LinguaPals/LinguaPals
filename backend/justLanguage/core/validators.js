import { dictById, ballsById, levelsById } from "./maps.js";

// Validate all content references at startup
// Fails hard if there are structural issues
export function validateContent() {
  console.log("Validating content integrity...");
  
  // Build canonical ID set (union of all dictionary IDs)
  const canonicalIds = new Set();
  for (const [lang, map] of Object.entries(dictById)) {
    for (const id of map.keys()) {
      canonicalIds.add(id);
    }
  }
  
  console.log(`  Canonical word IDs: ${canonicalIds.size}`);
  
  // Validate balls reference valid word IDs
  let ballErrors = [];
  for (const [ballId, ball] of ballsById.entries()) {
    for (const wordObj of ball.words) {
      const wordId = wordObj.id;
      
      if (!canonicalIds.has(wordId)) {
        ballErrors.push({
          ballId,
          ballName: ball.ballName,
          wordId,
          word: wordObj.word
        });
      }
    }
  }
  
  if (ballErrors.length > 0) {
    console.error("❌ VALIDATION FAILED: Balls reference non-existent word IDs:");
    ballErrors.slice(0, 10).forEach(err => {
      console.error(`  Ball ${err.ballId} (${err.ballName}): word ID ${err.wordId} (${err.word}) not in dictionaries`);
    });
    if (ballErrors.length > 10) {
      console.error(`  ... and ${ballErrors.length - 10} more errors`);
    }
    throw new Error(`Ball validation failed: ${ballErrors.length} invalid word references`);
  }
  
  console.log(`  ✓ All ball word references valid`);
  
  // Validate levels reference valid ball IDs
  let levelErrors = [];
  for (const [levelId, level] of levelsById.entries()) {
    for (const ballObj of level.balls) {
      const ballId = ballObj.ballId;
      
      if (!ballsById.has(ballId)) {
        levelErrors.push({
          levelId,
          levelName: level.levelName,
          ballId,
          ballName: ballObj.ballName
        });
      }
    }
  }
  
  if (levelErrors.length > 0) {
    console.error("❌ VALIDATION FAILED: Levels reference non-existent ball IDs:");
    levelErrors.forEach(err => {
      console.error(`  Level ${err.levelId} (${err.levelName}): ball ID ${err.ballId} (${err.ballName}) not found`);
    });
    throw new Error(`Level validation failed: ${levelErrors.length} invalid ball references`);
  }
  
  console.log(`  ✓ All level ball references valid`);
  console.log("✅ Content validation passed!");
}