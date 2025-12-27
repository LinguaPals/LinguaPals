const cleanText = (value) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed;
};

export const normalizeNextLearnItem = (apiResponse) => {
  const data = apiResponse?.data;

  if (!data) {
    return {
      done: true,
      wordId: null,
      activityType: "MC",
      direction: "nativeToTarget",
      promptText: "",
      correctAnswer: null,
      choices: [],
      flashcard: null,
      details: null,
      nativeWord: "",
      targetWord: "",
    };
  }

  const done = !!data.done;
  const activityType = data.activityType || "MC";
  const direction = data.direction || "nativeToTarget";

  const promptText = cleanText(data.promptText ?? data.prompt ?? "");

  const correctAnswer = cleanText(data.correctAnswer ?? "");

  const choices = Array.isArray(data.choices)
    ? data.choices.map((c) => ({
        text: cleanText(c?.text ?? ""),
        isCorrect: !!c?.isCorrect,
      }))
    : [];

  const flashcard =
    activityType === "Flashcard"
      ? {
          front: cleanText(data.front ?? ""),
          back: cleanText(data.back ?? ""),
        }
      : null;

  const details = data.details || null;

  const ballId = data.ballId != null ? Number(data.ballId) : null;
  const levelId = data.levelId != null ? Number(data.levelId) : null;

  const nativeWord = cleanText(data.nativeWord ?? "");
  const targetWord = cleanText(data.targetWord ?? "");

  return {
    done,
    wordId: typeof data.wordId === "number" ? data.wordId : Number(data.wordId),
    activityType,
    direction,
    ballId,
    levelId,
    promptText,
    correctAnswer,
    choices,
    flashcard,
    details,
    nativeWord,
    targetWord,
  };
};

export const normalizeAnswerResponse = (apiResponse) => {
  const word = apiResponse?.word;

  return {
    word: {
      wordId: word?.wordId,
      score: word?.score,
      attempts: word?.attempts,
      correct: word?.correct
    },
    unlockEvents: Array.isArray(apiResponse?.unlockEvents) ? apiResponse.unlockEvents : []
  };
};
