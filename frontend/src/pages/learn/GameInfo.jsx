import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/learn/logo.png";
import { ROUTES } from "../../lib/learn/routing.js";
import HeaderBar from "../../components/learn/HeaderBar";
import { fetchLearnProgress, getNextQuestion } from "../../lib/learn/api.js";
import useGameSettings from "../../hooks/useGameSettings";
import { pickGivenLanguage } from "../../lib/learn/routing.js";

/* Minimal inline icons to stay consistent with your custom set */
const HomeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...props}>
    <path
      d="M3 10.5L12 3l9 7.5"
      fill="none"
      stroke="#111827"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 10.5V20h13V10.5"
      fill="none"
      stroke="#111827"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CogIcon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...props}>
    <path
      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
      fill="none"
      stroke="#111827"
      strokeWidth="2"
    />
    <path
      d="M20 12a8 8 0 0 0-.13-1.45l2.03-1.58-2-3.46-2.45.76a8.1 8.1 0 0 0-2.51-1.45L14.5 2h-5l-.94 2.82a8.1 8.1 0 0 0-2.51 1.45l-2.45-.76-2 3.46 2.03 1.58A8 8 0 0 0 4 12c0 .49.05.97.13 1.45L2.1 15.03l2 3.46 2.45-.76c.77.64 1.62 1.14 2.51 1.45L9.5 22h5l.94-2.82c.9-.31 1.74-.81 2.51-1.45l2.45.76 2-3.46-2.03-1.58c.08-.48.13-.96.13-1.45Z"
      fill="none"
      stroke="#111827"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export default function GameInfo() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const stateWord = state?.word;
  const stateTranslated = state?.translated;
  const stateBallName = state?.ballName;
  const stateBallPct = state?.ballPct;
  const [ballInfo, setBallInfo] = React.useState({ ballName: stateBallName, ballPct: stateBallPct });
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const { settings } = useGameSettings();
  const givenLang = React.useMemo(() => pickGivenLanguage(settings?.languages), [settings?.languages]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [q, setQ] = React.useState(null);

  React.useEffect(() => {
    // If caller passed state, prefer it (optional override) and do not fetch.
    if (stateWord && stateTranslated) {
      setQ({ word: stateWord, translated: stateTranslated });
      return;
    }

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

    return () => {
      alive = false;
    };
  }, [stateWord, stateTranslated, givenLang, settings]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FBFF] to-[#F9FAFB] flex flex-col">
      {/* Top bar (same separation style as other screens) */}
      <HeaderBar
        left="home"
        right="cog"
        showAccent
        onRightClick={() => setSettingsOpen(true)}
      />

      {/* Ball progress */}
      <div className="w-full h-1.5 bg-slate-200">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${ballPct}%` }}
        />
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-screen-sm px-4 pb-20 pt-6">
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

        {!loading && !error && (!word || !translated) && (
          <div className="rounded-2xl bg-rose-50 shadow-sm ring-1 ring-rose-200 p-4 text-rose-800">
            <div className="text-sm font-semibold">Learn backend error</div>
            <div className="mt-1 text-sm">No usable question returned.</div>
          </div>
        )}

        {!loading && !error && word && translated && (
          <>
            {/* Title / word pill */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-mint-50 px-3 py-1 ring-1 ring-mint-200/70">
              <svg width="16" height="16" viewBox="0 0 24 24" className="text-mint-600">
                <path
                  d="M4 6h16M4 12h10M4 18h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-semibold text-slate-700">{word}</span>
            </div>

            {/* Headline card */}
            <div className="rounded-2xl bg-white shadow-md ring-1 ring-slate-200 p-5 mb-5">
              <p className="text-sm text-slate-500">
                You’ll be practicing a word from <span className="font-medium text-slate-700">{ballName}</span>
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Word</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">“{word}”</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Translation</p>
                  <p className="mt-1 text-lg font-semibold text-slate-800">{translated}</p>
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="space-y-3">
              {/* Definition */}
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
                <header className="mb-1.5 flex items-center gap-2 text-slate-600 font-semibold">
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-500">
                    <path
                      d="M4 19.5V6.4c0-.8.6-1.4 1.4-1.4H12v14H6.5A2.5 2.5 0 0 1 4 19.5zM12 5h5.1C18 5 19 6 19 7.1V19"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Definition
                </header>
                <p className="text-slate-800 leading-relaxed">
                  “Definition will be loaded from backend details in a future pass.”
                </p>
              </section>

              {/* Part of Speech */}
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
                <header className="mb-1.5 flex items-center gap-2 text-slate-600 font-semibold">
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-500">
                    <path
                      d="M4 12h16M7 5l5 7-5 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Part of Speech
                </header>
                <p className="text-slate-800">verb</p>
              </section>

              {/* Example */}
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
                <header className="mb-1.5 flex items-center gap-2 text-slate-600 font-semibold">
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-500">
                    <path
                      d="M7 7h10M7 12h7M7 17h10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Example
                </header>
                <p className="text-slate-800">Example sentence will be loaded from backend details in a future pass.</p>
              </section>

              {/* Synonyms */}
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
                <header className="mb-1.5 flex items-center gap-2 text-slate-600 font-semibold">
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-500">
                    <path
                      d="M8 12h8M6 16h12M10 8h4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Synonyms
                </header>
                <p className="text-slate-800">estudiar · memorizar</p>
              </section>

              {/* Forms */}
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4">
                <header className="mb-1.5 flex items-center gap-2 text-slate-600 font-semibold">
                  <svg width="18" height="18" viewBox="0 0 24 24" className="text-slate-500">
                    <path
                      d="M4 7h16M4 12h16M4 17h10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Forms
                </header>
                <p className="text-slate-800">aprendo, aprendiste, aprendiendo</p>
              </section>
            </div>

            {/* Continue */}
            <button
              onClick={() => navigate(ROUTES.GAME_MC, { state: { word, translated, ballName, ballPct } })}
              className="mt-6 w-full py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold shadow hover:bg-amber-300 transition"
            >
              Continue
            </button>
          </>
        )}
      </main>
    </div>
  );
}
