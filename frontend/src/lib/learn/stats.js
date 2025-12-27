const STORAGE_KEY = "linguapals.learn.results";

const safeJsonParse = (raw, fallback) => {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const recordResult = ({ wordId, correct }) => {
  const id = String(wordId ?? "");
  if (!id) return;

  const raw = localStorage.getItem(STORAGE_KEY);
  const existing = raw ? safeJsonParse(raw, {}) : {};

  const current = existing[id] || { attempts: 0, correct: 0, lastCorrect: null, updatedAt: null };

  const next = {
    attempts: (current.attempts || 0) + 1,
    correct: (current.correct || 0) + (correct ? 1 : 0),
    lastCorrect: !!correct,
    updatedAt: Date.now(),
  };

  const merged = { ...existing, [id]: next };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

  return next;
};
