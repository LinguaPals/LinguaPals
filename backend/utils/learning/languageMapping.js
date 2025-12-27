export function mapUserLanguageToDictCode(userLanguage) {
  if (!userLanguage) {
    return "en"; // Default to English
  }

  // Normalize to lowercase
  const normalized = String(userLanguage).toLowerCase().trim();

  // If already an ISO code, return it
  const validCodes = ["en", "es", "fr", "de", "it", "nl", "pt"];
  if (validCodes.includes(normalized)) {
    return normalized;
  }

  // Map full language names to codes
  const languageMap = {
    english: "en",
    spanish: "es",
    "español": "es",
    french: "fr",
    "français": "fr",
    german: "de",
    deutsch: "de",
    italian: "it",
    italiano: "it",
    dutch: "nl",
    nederlands: "nl",
    portuguese: "pt",
    "português": "pt"
  };

  const mapped = languageMap[normalized];
  if (mapped) {
    return mapped;
  }

  // Fallback to English if unknown
  console.warn(`Unknown user language: ${userLanguage}, defaulting to English`);
  return "en";
}

export function mapDictCodeToLanguageName(langCode) {
  if (!langCode) {
    return null;
  }

  const normalized = String(langCode).toLowerCase().trim();

  const codeToName = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    nl: "Dutch",
    pt: "Portuguese"
  };

  return codeToName[normalized] || null;
}
