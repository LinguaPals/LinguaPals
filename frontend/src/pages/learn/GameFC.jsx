import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BottomSheet from "../../components/learn/BottomSheet";
import BallProgressCard from "../../components/learn/BallProgressCard";
import SheetGameInfo from "../../components/learn/SheetGameInfo";
import TopSheet from "../../components/learn/TopSheet";
import GameSettingsSheet from "../../components/learn/GameSettingsSheet";
import { routeForType, pickNextType, pickGivenLanguage, withSearch } from "../../lib/learn/routing.js";
import useGameSettings from "../../hooks/useGameSettings";
import { ROUTES } from "../../lib/learn/routing.js";
import HeaderBar from "../../components/learn/HeaderBar";
import { fetchLearnProgress, getNextQuestion, submitAnswer } from "../../lib/learn/api";
import { recordResult } from "../../lib/learn/stats";

export default function GameFC() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location || {};

  const stateBallName = state?.ballName;
  const stateBallPct = state?.ballPct;
  const [ballInfo, setBallInfo] = React.useState({ ballName: stateBallName, ballPct: stateBallPct });

  const [revealed, setRevealed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [pending, setPending] = useState(false);
  // Given language for THIS question (picked on mount)
  const { settings } = useGameSettings();
  const [givenLang, setGivenLang] = React.useState(() => pickGivenLanguage(settings.languages));
  
  // Re-pick on every navigation (your ?r=timestamp ensures a new location.key)
  // and when applied settings.languages change.
  React.useEffect(() => {
    setGivenLang(pickGivenLanguage(settings.languages));
  }, [location.key, settings.languages]);
  
  const handleReveal = () => setRevealed(true);

  const [q, setQ] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const word = q?.word;
  const translated = q?.translated;

  React.useEffect(() => {
    if (typeof stateBallName === "string" && typeof stateBallPct === "number") {
      setBallInfo({ ballName: stateBallName, ballPct: stateBallPct });
      return;
    }

    const ballId = q?.ballId;
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
  }, [q?.ballId, stateBallName, stateBallPct]);

  const ballName = ballInfo?.ballName ?? "";
  const ballPct = typeof ballInfo?.ballPct === "number" ? ballInfo.ballPct : 0;

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setQ(null);
    getNextQuestion({ type: "flash", givenLang, settings })
      .then((next) => {
        if (!alive) return;
        setQ(next);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Failed to load question from backend");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => { alive = false; };
  }, [givenLang, settings]);

  const canRenderQuestion = !!word && !!translated && !!q?.wordId;

  const goToAnswer = (assessedCorrect) => {
    if (pending) return;
    if (!canRenderQuestion) return;
    setPending(true);
    submitAnswer({
      wordId: q?.wordId,
      activityType: q?.activityType || "Flashcard",
      difficulty: settings?.difficulty,
      result: assessedCorrect === true ? "correct" : "wrong",
    }).catch(() => {});

    // Persist basic per-word stats (frontend-only)
    try {
      recordResult({
        wordId: q?.wordId,
        correct: assessedCorrect === true,
      });
    } catch {}

    navigate(ROUTES.ANSWER_FC, {
      state: { word, translated, ballName, ballPct, assessedCorrect, givenLang, questionId: q?.wordId },
    });    
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FBFF] to-[#F9FAFB] flex flex-col">
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
        {loading && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 text-slate-700">
            <div className="text-sm font-semibold text-slate-900">Loading</div>
            <div className="mt-1 text-sm">Loading question from backend…</div>
          </div>
        )}
        {!loading && error && (
          <div className="rounded-2xl bg-rose-50 shadow-sm ring-1 ring-rose-200 p-4 text-rose-800">
            <div className="text-sm font-semibold">Learn backend error</div>
            <div className="mt-1 text-sm break-words">{error}</div>
          </div>
        )}
        {!loading && !error && !canRenderQuestion && (
          <div className="rounded-2xl bg-rose-50 shadow-sm ring-1 ring-rose-200 p-4 text-rose-800">
            <div className="text-sm font-semibold">Learn backend error</div>
            <div className="mt-1 text-sm">No usable question returned.</div>
          </div>
        )}

        {canRenderQuestion && (
          <>
        {/* Context pill */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-mint-50 px-3 py-1 ring-1 ring-mint-200/70">
          <svg width="16" height="16" viewBox="0 0 24 24" className="text-mint-600">
            <path d="M4 6h16M4 12h10M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">{ballName}</span>
        </div>

        {/* Ball progress */}
        <div className="w-full mb-4">
          <BallProgressCard
            compact
            pct={ballPct}
            progress={(ballPct || 0) / 100}
            ballName={ballName}
            onClick={() => navigate(ROUTES.PROGRESS)}
          />
        </div>

        {/* Flashcard */}
        <div
          className="w-full aspect-[3/2] rounded-2xl shadow-md ring-1 ring-slate-200 bg-white grid place-items-center text-xl font-semibold text-slate-800 cursor-pointer"
          onClick={handleReveal}
        >
          {!revealed
            ? (givenLang === "es" ? word : translated)
            : (givenLang === "es" ? translated : word)
          }

        </div>

        {/* Self-assess CTA */}
        {revealed && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => goToAnswer(true)}
              disabled={pending || !canRenderQuestion}
              aria-disabled={pending || !canRenderQuestion}
              className="py-3 rounded-xl bg-emerald-500 text-white font-semibold shadow hover:bg-emerald-400 transition"
            >
              I knew this
            </button>
            <button
              onClick={() => goToAnswer(false)}
              disabled={pending || !canRenderQuestion}
              aria-disabled={pending || !canRenderQuestion}
              className="py-3 rounded-xl bg-rose-500 text-white font-semibold shadow hover:bg-rose-400 transition"
            >
              I didn’t know
            </button>
          </div>
        )}
          </>
        )}
      </main>

      {/* Bottom sheet (shared game variant) */}
      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        minHeight={70}
        className="bg-gradient-to-b from-white to-slate-50"
        labelClosed="More info"
        labelOpen="Hide info"
      >
        <SheetGameInfo
          word={word}
          translated={translated}
        />
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
