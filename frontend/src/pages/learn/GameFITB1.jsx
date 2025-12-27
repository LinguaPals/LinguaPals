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

export default function GameFITB1() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location || {};

  const stateBallName = state?.ballName;
  const stateBallPct = state?.ballPct;
  const [ballInfo, setBallInfo] = React.useState({ ballName: stateBallName, ballPct: stateBallPct });

  const [input, setInput] = useState("");
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
  

  const [q, setQ] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const word = q?.word;
  const translated = q?.translated;
  const expected = q?.expected;
  const promptText = q?.promptText;

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
    getNextQuestion({ type: "spell", givenLang, settings })
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

  const normalized = (s) => String(s || "").trim().toLowerCase();
  const canRenderQuestion = !!word && !!translated && !!promptText && typeof expected === "string" && expected.length > 0 && !!q?.wordId;
  const canSubmit = input.trim().length > 0;

  const handleSubmit = () => {
    if (pending) return;
    if (!canRenderQuestion) return;
    if (!canSubmit) return;
    const isCorrect = normalized(input) === normalized(expected);

    submitAnswer({
      wordId: q?.wordId,
      activityType: q?.activityType || "FITB",
      difficulty: settings?.difficulty,
      result: isCorrect ? "correct" : "wrong",
    }).catch(() => {});

    // Persist basic per-word stats (frontend-only)
    try {
      recordResult({
        wordId: q?.wordId,
        correct: normalized(input) === normalized(expected),
      });
    } catch {}

    const payload = { isCorrect, word, translated, userAnswer: input, ballName, ballPct, questionId: q?.wordId };
     setPending(true);
    if (isCorrect) {
      navigate(ROUTES.GAME_CORRECT, { state: { ...payload, nextRoute: ROUTES.ANSWER_FITB, givenLang }, replace: true });
    } else {
      navigate(ROUTES.ANSWER_FITB, { state: { ...payload, givenLang } });
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && canSubmit) { e.preventDefault(); handleSubmit(); }
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
        {/* Context */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 ring-1 ring-emerald-200/70">
          <svg width="16" height="16" viewBox="0 0 24 24" className="text-emerald-600">
            <path d="M4 6h16M4 12h10M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">{ballName}</span>
        </div>

        {/* Ball progress (high) */}
        <div className="w-full mb-4">
          <BallProgressCard
            compact
            pct={ballPct}
            progress={(ballPct || 0) / 100}
            ballName={ballName}
            onClick={() => navigate(ROUTES.PROGRESS)}
          />
        </div>

        {/* Prompt */}
        <div className="mt-3 rounded-xl bg-sky-50 text-slate-800 text-center py-3 font-medium">
          {promptText}
        </div>


        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your answer"
            autoCapitalize="none"
            autoCorrect="off"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          />
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || pending || !canRenderQuestion}
            aria-disabled={!canSubmit || pending || !canRenderQuestion}
            className="px-4 py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold shadow hover:bg-amber-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
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
