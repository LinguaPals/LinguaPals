// src/components/SegmentedControl.jsx
import React from "react";

export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-grid grid-cols-3 rounded-xl ring-1 ring-slate-200 bg-white shadow-sm overflow-hidden">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "px-4 py-3 text-sm font-semibold transition",
              selected
                ? "bg-emerald-500 text-white"
                : "bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
            aria-pressed={selected}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
