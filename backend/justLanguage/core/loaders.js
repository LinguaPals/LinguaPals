import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load JSON files from data/learning directory
function loadJson(relativePath) {
  const fullPath = path.join(__dirname, "../../data/learning", relativePath);
  const raw = fs.readFileSync(fullPath, "utf8");
  return JSON.parse(raw);
}

// Load all dictionary files
export function loadAllDictionaries() {
  const langs = ["en", "es", "fr", "de", "it", "nl", "pt"];
  const dicts = {};
  
  for (const lang of langs) {
    const filePath = `dictionaries/dictionary_${lang}_final.json`;
    dicts[lang] = loadJson(filePath);
    console.log(`Loaded ${lang} dictionary: ${dicts[lang].length} entries`);
  }
  
  return dicts;
}

// Load all balls
export function loadBalls() {
  const balls = loadJson("all_balls_split.json");
  console.log(`Loaded ${balls.length} balls`);
  return balls;
}

// Load all levels
export function loadLevels() {
  const levels = loadJson("levels.json");
  console.log(`Loaded ${levels.length} levels`);
  return levels;
}