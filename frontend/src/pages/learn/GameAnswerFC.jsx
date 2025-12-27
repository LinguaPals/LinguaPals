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

export default function GameAnswerFC() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const {
    word,
    translated,
    ballName,
    ballPct,
    assessedCorrect,
  } = state || {};

  const givenLang = state?.givenLang ?? "es";

  const givenText = givenLang === "es" ? word : translated;
  const translatedText = givenLang === "es" ? translated : word;

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // If this screen wasn't reached from GameFC (no state), bounce back to FC.
  React.useEffect(() => {
    if (!word || !translated) {
      navigate(ROUTES.GAME_FC, { replace: true });
    }
  }, [word, translated, navigate]);

  if (!word || !translated) return null;

  const pct = typeof ballPct === "number" ? ballPct : 0;
  const hasAssessment = typeof assessedCorrect === "boolean";

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
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      {/* Main */}
      <main className="mx-auto w-full max-w-screen-sm flex-1 flex flex-col items-center justify-start px-4 py-6 text-center">
        {/* Ball progress (HIGH placement) */}
        <div className="w-full max-w-md mb-4" aria-label={`You have completed ${pct ?? 0}% of ${ballName || "this ball"}`}>
          <BallProgressCard
            compact
            pct={pct}
            progress={(pct || 0) / 100}
            ballName={ballName || "Basics"}
            onClick={() => navigate(ROUTES.PROGRESS)}
          />
        </div>

        {/* Outcome banner */}
        {hasAssessment && (
          <h1 className={`text-2xl font-bold mb-3 ${assessedCorrect ? "text-emerald-600" : "text-rose-600"}`}>
            {assessedCorrect ? "You're correct!" : "You're incorrect"}
          </h1>
        )}

        {/* Given/Translated */}
        <div className="w-full max-w-md rounded-2xl bg-white shadow-md ring-1 ring-slate-200 p-5 text-left">
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

          {hasAssessment && (
            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1 ${
                assessedCorrect
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200/70"
                  : "bg-rose-50 text-rose-700 ring-rose-200/70"
              }`}
            >
              <span className="text-[12px] font-semibold">
                {assessedCorrect ? "Counted as correct" : "Marked incorrect"}
              </span>
            </div>
          )}
        </div>

        {/* Continue */}
        <button
          onClick={handleContinue}
          className="mt-6 w-full max-w-md py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold shadow hover:bg-amber-300 transition"
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
