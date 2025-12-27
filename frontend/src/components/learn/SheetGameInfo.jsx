import React from "react";

export default function SheetGameInfo({
  word,
  translated,
  definition,
  partOfSpeech,
  examples,
  forms,
  synonyms,
}) {
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
      {definition ? (
        <div>
          <div className="text-xs font-medium text-slate-500">Definition</div>
          <div className="text-slate-700">{definition}</div>
        </div>
      ) : null}
      {partOfSpeech ? (
        <div>
          <div className="text-xs font-medium text-slate-500">Part of speech</div>
          <div className="text-slate-700">{partOfSpeech}</div>
        </div>
      ) : null}
      {Array.isArray(examples) && examples.length ? (
        <div>
          <div className="text-xs font-medium text-slate-500">Examples</div>
          <div className="text-slate-700">{examples.join("\n")}</div>
        </div>
      ) : null}
      {Array.isArray(forms) && forms.length ? (
        <div>
          <div className="text-xs font-medium text-slate-500">Forms</div>
          <div className="text-slate-700">{forms.join(", ")}</div>
        </div>
      ) : null}
      {Array.isArray(synonyms) && synonyms.length ? (
        <div>
          <div className="text-xs font-medium text-slate-500">Synonyms</div>
          <div className="text-slate-700">{synonyms.join(", ")}</div>
        </div>
      ) : null}
    </div>
  );
}
