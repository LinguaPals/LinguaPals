import React from "react";

export default function SheetAnswerInfo({ word, translated, children }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-medium text-slate-500">Word</div>
        <div className="text-lg font-semibold text-slate-900">{word ?? ""}</div>
      </div>
      <div>
        <div className="text-xs font-medium text-slate-500">Translation</div>
        <div className="text-slate-800">{translated ?? ""}</div>
      </div>
      {children}
    </div>
  );
}
