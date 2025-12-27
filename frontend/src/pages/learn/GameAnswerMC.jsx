import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomSheet from "../../components/learn/BottomSheet";
import BallProgressCard from "../../components/learn/BallProgressCard";
import SheetAnswerInfo from "../../components/learn/SheetAnswerInfo";
import TopSheet from "../../components/learn/TopSheet";
import GameSettingsSheet from "../../components/learn/GameSettingsSheet";
import useGameSettings from "../../hooks/useGameSettings";
import { routeForType, pickNextType, withSearch } from "../../lib/learn/routing.js";
import { ROUTES } from "../../lib/learn/routing.js";
import HeaderBar from "../../components/learn/HeaderBar";
import { fetchLearnProgress } from "../../lib/learn/api";

export default function GameAnswerMC() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  const isCorrect = state?.isCorrect ?? false;
  const word = state?.word ?? "aprender";
  const translated = state?.translated ?? "to learn";
  const userAnswer = state?.userAnswer ?? "—";
  const stateBallName = state?.ballName;
  const stateBallPct = state?.ballPct;
  const [ballInfo, setBallInfo] = React.useState({ ballName: stateBallName, ballPct: stateBallPct });

  const givenLang = state?.givenLang ?? "es";
  const givenText = givenLang === "es" ? word : translated;
  const translatedText = givenLang === "es" ? translated : word;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof stateBallName === "string" && typeof stateBallPct === "number") {
      setBallInfo({ ballName: stateBallName, ballPct: stateBallPct });
      return;
    }

    const ballId = state?.ballId;
    if (!ballId) return;

    let alive = true;
    fetchLearnProgress()
      .then((res) => {
        const data = res?.data || res;
        const ball = Array.isArray(data?.balls) ? data.balls.find((b) => Number(b.ballId) === Number(ballId)) : null;
        if (!alive || !ball) return;
        const pct = typeof ball.avgScore === "number" ? Math.round(ball.avgScore) : 0;
        setBallInfo({ ballName: ball.ballName, ballPct: pct });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [stateBallName, stateBallPct, state?.ballId]);

  const ballName = ballInfo?.ballName ?? "";
  const ballPct = typeof ballInfo?.ballPct === "number" ? ballInfo.ballPct : 0;


  const tone = isCorrect
    ? { bg: "bg-emerald-50", text: "text-emerald-700", chip: "bg-emerald-500", border: "border-emerald-200" }
    : { bg: "bg-rose-50", text: "text-rose-700", chip: "bg-rose-500", border: "border-rose-200" };

  const title = isCorrect ? "You're correct!" : "You're incorrect";
  const subtitle = isCorrect ? "Nice work — keep the streak going." : "Review the answer and try the next one.";

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
        <div className="w-full mb-4" aria-label={`You have completed ${ballPct ?? 0}% of ${ballName}`}>
          <BallProgressCard
            compact
            pct={ballPct}
            progress={(ballPct || 0) / 100}
            ballName={ballName}
            onClick={() => navigate(ROUTES.PROGRESS)}
          />
        </div>

        {/* Result card */}
        <div className={`rounded-2xl border ${tone.border} ${tone.bg} p-5 mb-5`}>
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${tone.chip} text-white`}>
              {isCorrect ? (
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M6 6l12 12M18 6l-12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <h2 className={`text-base font-semibold ${tone.text}`}>{title}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-3">
              <div className="text-xs font-medium text-slate-500">Given</div>
              <div className="mt-1 text-slate-900 font-semibold">{givenText}</div>
            </div>
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-3">
              <div className="text-xs font-medium text-slate-500">Translated</div>
              <div className="mt-1 text-slate-900 font-semibold">{translatedText}</div>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-3">
            <div className="text-xs font-medium text-slate-500">Your answer</div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-slate-900 font-semibold">{userAnswer}</span>
              <span className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
          </div>
        </div>

        <button onClick={handleContinue} className="w-full py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold shadow hover:bg-amber-300 transition">
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
        <SheetAnswerInfo
          word={word}
          translated={translated}
          // optional: pass richer data from your API when wired up
        />
        <p className="mt-5 text-center text-xs text-slate-400">Swipe down or tap outside to close</p>
        <div className="pointer-events-none absolute inset-x-0 -top-4 h-4 bg-gradient-to-b from-slate-900/10 to-transparent rounded-t-3xl" />
      </BottomSheet>
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
