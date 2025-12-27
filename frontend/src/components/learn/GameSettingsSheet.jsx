// src/components/GameSettingsSheet.jsx
import React from "react";
import useGameSettings, { DEFAULT_SETTINGS } from "../../hooks/useGameSettings";
import PillToggle from "./PillToggle";
import SegmentedControl from "./SegmentedControl";
import { fetchLearnModes, getLearnScope, setLearnScope } from "../../lib/learn/api";

const TYPE_LABELS = {
  mc: "Multiple Choice",
  spell: "Spelling",
  fill: "Fill In",
  flash: "Flash Card",
};
const LANG_LABELS = {
  en: "English",
  es: "Spanish",
};

export default function GameSettingsSheet({ open, onApplied, onClose }) {
  const { settings, applySettings, createDraft } = useGameSettings();

  // Local draft (discard on close if not applied)
  const [draft, setDraft] = React.useState(() => createDraft());

  // Reset draft any time committed settings change (e.g., opened after a prior apply)
  React.useEffect(() => {
    if (open) {
      setDraft(createDraft()); // pull latest committed (already normalized to defaults)
    }
  }, [open, createDraft]);

  const [modesLoading, setModesLoading] = React.useState(false);
  const [modesError, setModesError] = React.useState(null);
  const [modesData, setModesData] = React.useState(null);

  const [scope, setScope] = React.useState(() => getLearnScope());

  React.useEffect(() => {
    if (!open) return;
    setScope(getLearnScope());

    let alive = true;
    setModesLoading(true);
    setModesError(null);
    setModesData(null);

    fetchLearnModes()
      .then((res) => {
        if (!alive) return;
        setModesData(res?.data || res);
      })
      .catch((e) => {
        if (!alive) return;
        setModesError(e?.message || "Failed to load learn modes");
      })
      .finally(() => {
        if (!alive) return;
        setModesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open]);
  

  const toggleMulti = (key, val) => {
    setDraft((d) => {
      const arr = new Set(d[key] || []);
      if (arr.has(val)) arr.delete(val);
      else arr.add(val);
      return { ...d, [key]: Array.from(arr) };
    });
  };

  const setDifficulty = (val) => setDraft((d) => ({ ...d, difficulty: val }));

  const handleApply = () => {
    setLearnScope(scope);
    const committed = applySettings(draft);
    onApplied?.(committed); // parent decides what "new question" means
  };

  return (
    <div className="mx-auto w-full max-w-screen-sm">
      {/* Header */}
      <div className="py-2 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Game Settings</h2>
      </div>

      {/* Section: Learning Scope */}
      <section className="mt-3 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">Learning Scope</h3>

        {modesLoading && <div className="text-sm text-slate-600">Loading learning modes…</div>}
        {!modesLoading && modesError && <div className="text-sm text-rose-700">{modesError}</div>}

        {!modesLoading && !modesError && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <PillToggle
                label="Recommended"
                selected={(scope?.mode || "model") === "model"}
                onToggle={() => setScope({ mode: "model" })}
              />
              <PillToggle
                label="Review"
                selected={(scope?.mode || "model") === "masteredReview"}
                onToggle={() => setScope({ mode: "masteredReview" })}
              />
              <PillToggle
                label="Level"
                selected={(scope?.mode || "model") === "level"}
                onToggle={() => {
                  const first = Array.isArray(modesData?.unlockedLevels) ? modesData.unlockedLevels[0] : null;
                  setScope({ mode: "level", levelId: first?.levelId });
                }}
              />
              <PillToggle
                label="Ball"
                selected={(scope?.mode || "model") === "ball"}
                onToggle={() => {
                  const first = Array.isArray(modesData?.unlockedBalls) ? modesData.unlockedBalls[0] : null;
                  setScope({ mode: "ball", ballId: first?.ballId });
                }}
              />
            </div>

            {(scope?.mode || "model") === "masteredReview" && !modesData?.masteredReviewAvailable && (
              <p className="mt-2 text-xs text-slate-500">No review items available yet.</p>
            )}

            {(scope?.mode || "model") === "level" && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-500">Choose level</label>
                <select
                  value={scope?.levelId ?? ""}
                  onChange={(e) => setScope({ mode: "level", levelId: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  {(Array.isArray(modesData?.unlockedLevels) ? modesData.unlockedLevels : []).map((l) => (
                    <option key={l.levelId} value={l.levelId}>
                      {l.levelName ?? `Level ${l.levelId}`} ({l.progressPercent ?? 0}%)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(scope?.mode || "model") === "ball" && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-500">Choose ball</label>
                <select
                  value={scope?.ballId ?? ""}
                  onChange={(e) => setScope({ mode: "ball", ballId: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  {(Array.isArray(modesData?.unlockedBalls) ? modesData.unlockedBalls : []).map((b) => (
                    <option key={b.ballId} value={b.ballId}>
                      {b.ballName ?? `Ball ${b.ballId}`} ({b.progressPercent ?? 0}%)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="mt-2 text-xs text-slate-500">
              Recommended uses your unlocked content. Level and Ball limit questions to the selected scope.
            </p>
          </>
        )}
      </section>

      {/* Section: Types of questions */}
      <section className="mt-3 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">Types of Questions</h3>
        <div className="grid grid-cols-2 gap-2">
          {["mc", "spell", "fill", "flash"].map((t) => (
            <PillToggle
              key={t}
              label={TYPE_LABELS[t]}
              selected={(draft.types || []).includes(t)}
              onToggle={() => toggleMulti("types", t)}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Select any number of types. If none selected, defaults to {TYPE_LABELS[DEFAULT_SETTINGS.types[0]]}.
        </p>
      </section>

      {/* Section: Given Language */}
      <section className="mt-3 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">Given Language</h3>
        <div className="grid grid-cols-2 gap-2">
          {["en", "es"].map((l) => (
            <PillToggle
              key={l}
              label={LANG_LABELS[l]}
              selected={(draft.languages || []).includes(l)}
              onToggle={() => toggleMulti("languages", l)}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Select one or both. If none selected, defaults to {LANG_LABELS[DEFAULT_SETTINGS.languages[0]]}.
        </p>
      </section>

      {/* Section: Question Difficulty */}
      <section className="mt-3 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">Question Difficulty</h3>
        <SegmentedControl
          value={draft.difficulty}
          onChange={setDifficulty}
          options={[
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
        />
      </section>

      {/* Apply button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleApply}
          className="w-full py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold shadow hover:bg-amber-300 active:scale-[0.98] transition"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
