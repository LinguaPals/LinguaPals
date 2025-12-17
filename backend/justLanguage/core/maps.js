// In-memory maps built at startup
// These are global and shared across all requests

// Dictionary maps: { lang: Map<wordId, dictEntry> }
export let dictById = {};

// Ball and level maps
export let ballsById = new Map();
export let levelsById = new Map();

// Reverse indexes
export let wordToBalls = new Map();  // Map<wordId, ballId[]>
export let ballToLevel = new Map();  // Map<ballId, levelId>

// Untranslatable words per language
export let untranslatablesByLang = {}; // { lang: Set<wordId> }

// Build all maps from loaded data
export function buildMaps(dicts, balls, levels) {
  console.log("Building in-memory maps...");
  
  // Build dictionary maps and detect untranslatables
  for (const [lang, entries] of Object.entries(dicts)) {
    const map = new Map();
    const untransSet = new Set();
    
    for (const entry of entries) {
      map.set(entry.id, entry);
      
      // Detect untranslatables (word is null)
      if (entry.word === null) {
        untransSet.add(entry.id);
      }
    }
    
    dictById[lang] = map;
    untranslatablesByLang[lang] = untransSet;
    
    console.log(`  ${lang}: ${map.size} words, ${untransSet.size} untranslatable`);
  }
  
  // Build balls map and wordToBalls reverse index
  for (const ball of balls) {
    ballsById.set(ball.ballId, ball);
    
    // Build wordToBalls reverse index
    for (const wordObj of ball.words) {
      const wordId = wordObj.id;
      
      if (!wordToBalls.has(wordId)) {
        wordToBalls.set(wordId, []);
      }
      wordToBalls.get(wordId).push(ball.ballId);
    }
  }
  
  console.log(`  Balls: ${ballsById.size} total`);
  
  // Build levels map and ballToLevel reverse index
  for (const level of levels) {
    levelsById.set(level.levelId, level);
    
    // Build ballToLevel reverse index
    for (const ballObj of level.balls) {
      ballToLevel.set(ballObj.ballId, level.levelId);
    }
  }
  
  console.log(`  Levels: ${levelsById.size} total`);
  console.log("Maps built successfully!");
}