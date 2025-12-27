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

export default function GameMC() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location || {};

  const stateBallName = state?.ballName;
  const stateBallPct = state?.ballPct;
  const [ballInfo, setBallInfo] = React.useState({ ballName: stateBallName, ballPct: stateBallPct });

  const [selected, setSelected] = useState(null);
  const [pending, setPending] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // Given language for THIS question (picked on mount, obeys Settings.languages)
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

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setQ(null);
    getNextQuestion({ type: "mc", givenLang, settings })
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
    // re-run when route remounts (your ?r= forces remount), or when givenLang changes
  }, [givenLang, settings]);

  const word = q?.word;
  const translated = q?.translated;
  const correctIndex = typeof q?.correctIndex === "number" ? q.correctIndex : null;
  const choicesEn = Array.isArray(q?.choicesEn) ? q.choicesEn : null;
  const choicesEs = Array.isArray(q?.choicesEs) ? q.choicesEs : null;
  const displayedChoices = givenLang === "es" ? choicesEn : choicesEs;

  React.useEffect(() => {
    // If caller passed explicit ball info in state, keep it.
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

  const canRenderQuestion = !!word && !!translated && Array.isArray(displayedChoices) && displayedChoices.length > 0 && typeof correctIndex === "number";

  const handleCheck = () => {
    if (pending) return;
    if (!canRenderQuestion) return;
    if (selected == null) return;
    const payload = {
      isCorrect: selected === correctIndex,
      word,
      translated,
      userAnswer: displayedChoices[selected],
      ballName,
      ballPct,
      givenLang,
      questionId: q?.wordId,
    };

    submitAnswer({
      wordId: q?.wordId,
      activityType: q?.activityType || "MC",
      difficulty: settings?.difficulty,
      result: selected === correctIndex ? "correct" : "wrong",
    }).catch(() => {});

     // Persist basic per-word stats (frontend-only)
    try {
      recordResult({
        wordId: q?.wordId,
        correct: selected === correctIndex,
      });
    } catch {}
    
    if (payload.isCorrect) {
      setPending(true);
      navigate(ROUTES.GAME_CORRECT, {
        state: { ...payload, nextRoute: ROUTES.ANSWER_MC },
        replace: true,
      });
    } else {
      navigate(ROUTES.ANSWER_MC, { state: payload });
    }
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
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${ballPct}%` }}
        />
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
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 ring-1 ring-emerald-200/70">
              <svg width="16" height="16" viewBox="0 0 24 24" className="text-emerald-600">
                <path
                  d="M4 6h16M4 12h10M4 18h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-semibold text-slate-700">{ballName}</span>
            </div>

        <div className="w-full mb-4">
          <BallProgressCard
            compact
            pct={ballPct}
            progress={(ballPct || 0) / 100}
            ballName={ballName}
            onClick={() => navigate(ROUTES.PROGRESS)}
          />
        </div>

        <div className="rounded-2xl bg-white shadow-md ring-1 ring-slate-200 p-4 mb-5">
        <div className="text-center text-sm text-slate-500">
          Translate into <span className="font-medium">{givenLang === "es" ? "English" : "Spanish"}</span>
        </div>

          <div className="mt-3 rounded-xl bg-sky-50 text-slate-800 text-center py-3 font-semibold">
            “{givenLang === "es" ? word : translated}”
          </div>
        </div>

        <div className="space-y-3">
          {displayedChoices.map((c, idx) => {
            const active = selected === idx;
            return (
              <button
                key={c}
                onClick={() => setSelected(idx)}
                className={`w-full py-3 rounded-xl border transition ${
                  active
                    ? "bg-emerald-500 text-white border-emerald-500 shadow"
                    : "bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleCheck}
          className="mt-5 w-full py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold shadow hover:bg-amber-300 transition disabled:opacity-60"
          disabled={pending || selected == null || !canRenderQuestion}
          aria-disabled={pending || selected == null || !canRenderQuestion}
        >

          Check
        </button>
          </>
        )}
      </main>

      {/* Bottom sheet */}
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
