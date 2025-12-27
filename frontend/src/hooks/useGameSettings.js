import React from "react";

export const DEFAULT_SETTINGS = {
  types: ["mc", "spell", "fill", "flash"],
  languages: ["en", "es"],
  difficulty: "easy",
};

const STORAGE_KEY = "linguapals.learn.gameSettings";

function normalizeSettings(input) {
  const s = input && typeof input === "object" ? input : {};

  const types = Array.isArray(s.types) ? s.types.filter(Boolean) : [];
  const languages = Array.isArray(s.languages) ? s.languages.filter(Boolean) : [];
  const difficulty = typeof s.difficulty === "string" && s.difficulty ? s.difficulty : DEFAULT_SETTINGS.difficulty;

  return {
    types: types.length ? types : DEFAULT_SETTINGS.types,
    languages: languages.length ? languages : DEFAULT_SETTINGS.languages,
    difficulty,
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persistSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export default function useGameSettings() {
  const [settings, setSettings] = React.useState(() => loadSettings());

  const applySettings = React.useCallback((draft) => {
    const next = normalizeSettings(draft);
    setSettings(next);
    persistSettings(next);
    return next;
  }, []);

  const createDraft = React.useCallback(() => normalizeSettings(settings), [settings]);

  return {
    settings,
    applySettings,
    createDraft,
  };
}
