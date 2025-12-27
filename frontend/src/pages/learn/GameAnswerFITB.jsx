import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomSheet from "../../components/learn/BottomSheet";
import BallProgressCard from "../../components/learn/BallProgressCard";
import SheetAnswerInfo from "../../components/learn/SheetAnswerInfo";
import TopSheet from "../../components/learn/TopSheet";
import GameSettingsSheet from "../../components/learn/GameSettingsSheet";
import useGameSettings from "../../hooks/useGameSettings";
import { routeForType, pickNextType, ROUTES, withSearch } from "../../lib/learn/routing.js";
import HeaderBar from "../../components/learn/HeaderBar";
import { recordResult } from "../../lib/learn/stats";

export default function GameAnswerFITB() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const {
    isCorrect: initialCorrect = false,
    word = "",
    translated = "",
    userAnswer = "",
    ballName = "",
    ballPct = 0,
  } = state || {};

  const givenLang = state?.givenLang ?? "es";
  const givenText = givenLang === "es" ? word : translated;
  const translatedText = givenLang === "es" ? translated : word;

  const [isCorrect, setIsCorrect] = React.useState(!!initialCorrect);
  const [locked, setLocked] = React.useState(!!initialCorrect);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const markMisspelled = () => {
    setIsCorrect(true);
    setLocked(true);
    // Optional: persist as correct so local stats reflect the override
    try {
      recordResult({ wordId: state?.questionId ?? word, correct: true });
    } catch {}
    };

  const { settings } = useGameSettings();

  const handleContinue = () => {
    const nextType = pickNextType(settings.types);
    const next = routeForType(nextType);
    navigate(withSearch(next, { r: Date.now() }), { replace: true });
  };  

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FBFF] to-[#F9FAFB] flex flex-col">
      {/* Top bar */}
      <HeaderBar
        left="home"
        right="cog"
        showAccent
        onRightClick={() => setSettingsOpen(true)}
      />


      {/* Thin stripe */}
      <div className="w-full h-1.5 bg-slate-200">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${ballPct}%` }} />
      </div>

      {/* Main */}
      <main className="mx-auto w-full max-w-screen-sm px-4 pb-28 pt-6">
        {/* Ball progress (HIGH placement) */}
        <div className="w-full mb-4" aria-label={`You have completed ${ballPct ?? 0}% of ${ballName || "this ball"}`}>
          <BallProgressCard
            compact
            pct={ballPct}
            progress={(ballPct || 0) / 100}
            ballName={ballName}
            onClick={() => navigate(ROUTES.PROGRESS)}
          />
        </div>

        {/* Outcome banner */}
        <h1 className={`text-2xl font-bold mb-3 ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
          {isCorrect ? "You're correct!" : "You're incorrect"}
        </h1>

        {/* Answer card */}
        <div className="w-full rounded-2xl bg-white shadow-md ring-1 ring-slate-200 p-5 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Given</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">“{givenText}”</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Translated</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{translatedText}</p>
              </div>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Your answer</p>
            <p className={`mt-1 text-lg font-semibold ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
              {userAnswer || "—"}
            </p>
          </div>

          {locked && (
            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ${
                isCorrect
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
                  : "bg-rose-50 text-rose-700 ring-rose-200/70"
              }`}
            >
              <span className="text-[12px] font-semibold">
                {isCorrect ? "Counted as correct" : "Marked incorrect"}
              </span>
            </div>
          )}
        </div>

        {/* Misspelled override */}
        {!isCorrect && !locked && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-slate-600">Did you misspell?</p>
            <button
              onClick={markMisspelled}
              aria-label="Mark as misspelled and count as correct"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-400 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              Yes
            </button>
          </div>
        )}

        {/* Continue CTA -> send to next question (temporary = MC) */}
        <button
          onClick={handleContinue}
          className="mt-6 w-full py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold shadow hover:bg-amber-300 transition"
        >
          Continue
        </button>
      </main>

      {/* Bottom sheet (ANSWER variant) */}
      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        minHeight={70}
        className="bg-gradient-to-b from-white to-slate-50"
        labelClosed="More info"
        labelOpen="Hide info"
      >
        <SheetAnswerInfo word={word} translated={translated} />
        <p className="mt-5 text-center text-xs text-slate-400">Swipe down or tap outside to close</p>
        <div className="pointer-events-none absolute inset-x-0 -top-4 h-4 bg-gradient-to-b from-slate-900/10 to-transparent rounded-t-3xl" />
      </BottomSheet>

      {/* Settings Top Sheet */}
      <TopSheet open={settingsOpen} onOpenChange={setSettingsOpen} labelOpen="Swipe up to close">
        <GameSettingsSheet
          open={settingsOpen}
          onApplied={(committed) => {
            setSettingsOpen(false);
            const nextType = pickNextType(committed.types);
            const path = routeForType(nextType);
            navigate(withSearch(path, { r: Date.now() }), { replace: true });
          }}
        />
      </TopSheet>
    </div>
  );
}
