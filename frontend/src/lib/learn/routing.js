// src/lib/routing.js

// ---------- Central route map ----------
export const ROUTES = Object.freeze({
  // Landing & Auth
  LANDING: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ONBOARDING: "/onboarding",

  // Main
  HOME: "/home",
  PROFILE: "/profile",
  PROGRESS: "/progress",
  SETTINGS: "/settings",
  UPGRADE: "/upgrade",

  // Game
  GAME_INFO: "/game/info",
  GAME_MC: "/game/mc",
  GAME_FITB1: "/game/fitb1",  // “spell”
  GAME_FITB2: "/game/fitb2",  // “fill”
  GAME_FC: "/game/fc",        // “flash”
  GAME_CORRECT: "/game/correct",

  // Answers
  ANSWER_MC: "/game/answer/mc",
  ANSWER_FITB: "/game/answer/fitb",
  ANSWER_FC: "/game/answer/fc",

  // Collections / Reference
  WORDS: "/all-words",
  BALLS: "/all-balls",
  STRUGGLES: "/struggles",
  SEARCH: "/search",
  WORD: "/word",

  // Fallback
  NOT_FOUND: "*",
});

// ---------- Helpers ----------

// Map game "type" -> game route
export function routeForType(type) {
  switch (type) {
    case "mc":    return ROUTES.GAME_MC;
    case "spell": return ROUTES.GAME_FITB1; // Spelling → FITB1
    case "fill":  return ROUTES.GAME_FITB2; // Fill in → FITB2
    case "flash": return ROUTES.GAME_FC;    // Flashcards → FC
    default:      return ROUTES.GAME_MC;
  }
}

// Map game "type" -> answer route
export function answerRouteForType(type) {
  switch (type) {
    case "mc":    return ROUTES.ANSWER_MC;
    case "spell": return ROUTES.ANSWER_FITB;
    case "fill":  return ROUTES.ANSWER_FITB;
    case "flash": return ROUTES.ANSWER_FC;
    default:      return ROUTES.ANSWER_MC;
  }
}

// If 1 type: always that. If >1: randomize. If empty: default "mc".
export function pickNextType(types) {
  const arr = Array.isArray(types) && types.length ? [...new Set(types)] : ["mc"];
  return arr.length === 1 ? arr[0] : arr[Math.floor(Math.random() * arr.length)];
}

// Languages (keep for when you thread it into question generation)
export function pickGivenLanguage(languages) {
  const arr = Array.isArray(languages) && languages.length ? [...new Set(languages)] : ["en"];
  return arr.length === 1 ? arr[0] : arr[Math.floor(Math.random() * arr.length)];
}

// Add query params: withSearch("/p", { r: Date.now() })
export function withSearch(pathname, params) {
  const q = new URLSearchParams(params);
  const qs = q.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

// Decide next route immediately after answering a question
// - Normal: correct → GAME_CORRECT ; incorrect → ANSWER_*
// - If user overrides "I actually knew this" on the Answer page → stay in ANSWER_* (no bounce)
export function getNextRoute({ type, wasCorrect, overrode = false }) {
  if (overrode) return answerRouteForType(type);
  return wasCorrect ? ROUTES.GAME_CORRECT : answerRouteForType(type);
}
