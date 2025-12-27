import React from "react";

export default function BallProgressCard({ compact, pct, progress, ballName, onClick }) {
  const value = typeof pct === "number" ? pct : typeof progress === "number" ? Math.round(progress * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
        "px-4 py-3",
        compact ? "" : "py-5",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500">Progress</div>
          <div className="mt-0.5 text-sm font-semibold text-slate-900">{ballName ?? ""}</div>
        </div>
        <div className="text-sm font-semibold text-slate-700">{value}%</div>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </button>
  );
}
