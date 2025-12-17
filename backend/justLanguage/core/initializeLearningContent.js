import { loadAllDictionaries, loadBalls, loadLevels } from "./loaders.js";
import { buildMaps } from "./maps.js";
import { validateContent } from "./validators.js";

// Main initialization function
// Called once at server startup after DB connection
export async function initializeLearningContent() {
  console.log("\n=== Initializing Learning Content ===");
  
  try {
    // Load all JSON files
    const dicts = loadAllDictionaries();
    const balls = loadBalls();
    const levels = loadLevels();
    
    // Build in-memory maps
    buildMaps(dicts, balls, levels);
    
    // Validate all references
    validateContent();
    
    console.log("=== Learning Content Initialized Successfully ===\n");
  } catch (error) {
    console.error("\n❌ FATAL: Learning content initialization failed:");
    console.error(error.message);
    console.error("\nServer cannot start with invalid learning content.");
    throw error; // Re-throw to stop server startup
  }
}