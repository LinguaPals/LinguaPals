import { getLearnModes, getLearnProgress, getNextLearnItem, submitLearnAnswer } from "../../services/learnService";
import { normalizeNextLearnItem, normalizeAnswerResponse } from "../../adapters/learnAdapter";

const getLearningLangCode = () => {
  const code = localStorage.getItem("learningLangCode");
  return code && typeof code === "string" ? code : "es";
};

const LEARN_SCOPE_KEY = "learnScope";

export const getLearnScope = () => {
  try {
    const raw = localStorage.getItem(LEARN_SCOPE_KEY);
    if (!raw) return { mode: "model" };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { mode: "model" };

    const mode = typeof parsed.mode === "string" ? parsed.mode : "model";
    const levelId = parsed.levelId != null ? Number(parsed.levelId) : undefined;
    const ballId = parsed.ballId != null ? Number(parsed.ballId) : undefined;

    if (mode === "level" && !Number.isFinite(levelId)) return { mode: "model" };
    if (mode === "ball" && !Number.isFinite(ballId)) return { mode: "model" };

    if (mode === "masteredReview") return { mode };
    if (mode === "level") return { mode, levelId };
    if (mode === "ball") return { mode, ballId };
    return { mode: "model" };
  } catch {
    return { mode: "model" };
  }
};

export const setLearnScope = (scope) => {
  const mode = scope?.mode;
  const payload = { mode: "model" };

  if (mode === "masteredReview") {
    payload.mode = "masteredReview";
  } else if (mode === "level") {
    payload.mode = "level";
    payload.levelId = Number(scope?.levelId);
  } else if (mode === "ball") {
    payload.mode = "ball";
    payload.ballId = Number(scope?.ballId);
  }

  localStorage.setItem(LEARN_SCOPE_KEY, JSON.stringify(payload));
  return payload;
};

export const fetchLearnProgress = async () => {
  const langCode = getLearningLangCode();
  return getLearnProgress({ langCode });
};

export const fetchLearnModes = async () => {
  const langCode = getLearningLangCode();
  return getLearnModes({ langCode });
};

const toDirection = (givenLang) => {
  // learn pages treat `givenLang` as the language shown to the user.
  // Our API wrapper maps this to the backend's direction concept.
  // NOTE: This is a best-effort mapping and may need adjustment once backend payload is finalized.
  return givenLang === "en" ? "nativeToTarget" : "targetToNative";
};

const toActivityTypes = (type) => {
  // Backend adapter uses: MC, FITB, Flashcard
  // Learn pages use: mc, spell, fill, flash
  switch (type) {
    case "mc":
      return ["MC"];
    case "spell":
    case "fill":
      return ["FITB"];
    case "flash":
      return ["Flashcard"];
    default:
      return undefined;
  }
};

const toActivityTypeLabel = (type) => {
  switch (type) {
    case "spell":
    case "fill":
      return "FITB";
    case "flash":
      return "Flashcard";
    case "mc":
    default:
      return "MC";
  }
};

const derivePromptText = (card) => {
  if (card?.promptText) return card.promptText;
  if (card?.direction === "nativeToTarget") return card?.nativeWord || "";
  if (card?.direction === "targetToNative") return card?.targetWord || "";
  return card?.nativeWord || card?.targetWord || "";
};

const deriveExpectedAnswer = (card) => {
  if (card?.correctAnswer) return card.correctAnswer;
  if (card?.direction === "nativeToTarget") return card?.targetWord || "";
  if (card?.direction === "targetToNative") return card?.nativeWord || "";
  return card?.targetWord || card?.nativeWord || "";
};

const buildBaseQuestion = (card) => {
  const promptText = derivePromptText(card);
  const expected = deriveExpectedAnswer(card);
  const nativeWord = card?.nativeWord || "";
  const targetWord = card?.targetWord || "";

  const word =
    targetWord ||
    (card?.direction === "nativeToTarget" ? expected : promptText) ||
    "";
  const translated =
    nativeWord ||
    (card?.direction === "nativeToTarget" ? promptText : expected) ||
    "";

  if (!word || !translated) {
    throw new Error("Backend did not provide word/translation");
  }

  return {
    id: card?.wordId ?? null,
    wordId: card?.wordId ?? null,
    activityType: card?.activityType || null,
    ballId: card?.ballId ?? null,
    levelId: card?.levelId ?? null,
    direction: card?.direction,
    word,
    translated,
    promptText,
    expected,
    details: card?.details ?? null,
    raw: card ?? null,
    done: false,
  };
};

const mapMultipleChoice = (card) => {
  const base = buildBaseQuestion(card);
  const choices = Array.isArray(card?.choices) ? card.choices : [];
  if (!choices.length) {
    throw new Error("Backend did not provide choices for MC");
  }
  const choiceTexts = choices.map((c) => c?.text ?? "");
  const correctIndexRaw = choices.findIndex((c) => c?.isCorrect);
  const correctIndex = correctIndexRaw >= 0 ? correctIndexRaw : 0;

  const isTargetToNative = card?.direction === "targetToNative";
  return {
    ...base,
    correctIndex,
    choicesEn: isTargetToNative ? choiceTexts : [],
    choicesEs: isTargetToNative ? [] : choiceTexts,
  };
};

const mapFillIn = (card) => {
  const base = buildBaseQuestion(card);
  return {
    ...base,
  };
};

const mapFlashcard = (card) => {
  const base = buildBaseQuestion(card);
  const flashFront =
    card?.flashcard?.front ||
    (card?.direction === "nativeToTarget" ? base.translated : base.word);
  const flashBack =
    card?.flashcard?.back ||
    (card?.direction === "nativeToTarget" ? base.word : base.translated);
  return {
    ...base,
    flashcardFront: flashFront,
    flashcardBack: flashBack,
  };
};

export const getNextQuestion = async ({ type, givenLang, settings }) => {
  const difficulty = settings?.difficulty;
  const langCode = getLearningLangCode();

  const scope = getLearnScope();

  const apiResponse = await getNextLearnItem({
    langCode,
    mode: scope.mode || "model",
    levelId: scope.mode === "level" ? scope.levelId : undefined,
    ballId: scope.mode === "ball" ? scope.ballId : undefined,
    direction: toDirection(givenLang),
    difficulty,
    activityTypes: toActivityTypes(type),
    includeDetails: true,
  });

  const card = normalizeNextLearnItem(apiResponse);

  if (!card || card.done) {
    return {
      done: true,
      activityType: card?.activityType || toActivityTypeLabel(type),
      ballId: card?.ballId ?? null,
      levelId: card?.levelId ?? null,
      raw: card ?? null,
    };
  }

  const activity = card.activityType || toActivityTypeLabel(type);

  switch (activity) {
    case "MC":
      return mapMultipleChoice(card);
    case "FITB":
      return mapFillIn(card);
    case "Flashcard":
      return mapFlashcard(card);
    default:
      return mapMultipleChoice(card);
  }
};

export const submitAnswer = async ({ wordId, activityType, difficulty, result, misspellOverride }) => {
  const langCode = getLearningLangCode();
  const apiResponse = await submitLearnAnswer({
    langCode,
    wordId,
    activityType,
    difficulty,
    result,
    misspellOverride,
  });

  return normalizeAnswerResponse(apiResponse);
};
