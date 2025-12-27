// src/components/PillToggle.jsx
import React from "react";

export default function PillToggle({ label, selected, onToggle, className = "" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "px-4 py-3 rounded-xl ring-1 transition transform active:scale-[0.98] shadow-sm font-medium",
        selected
          ? "bg-emerald-500 text-white ring-emerald-300"
          : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50",
        className,
      ].join(" ")}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
