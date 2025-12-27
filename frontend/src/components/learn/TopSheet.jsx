import React from "react";

export default function TopSheet({ open, onOpenChange, labelOpen, children }) {
  const isOpen = !!open;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/30"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="absolute inset-x-0 top-0">
        <div className="mx-auto max-w-screen-sm px-4 pt-4">
          <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 p-4">
            {labelOpen ? <div className="mb-3 text-center text-xs text-slate-500">{labelOpen}</div> : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
