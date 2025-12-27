import React from "react";

export default function BottomSheet({
  open,
  onOpenChange,
  minHeight,
  className = "",
  labelClosed,
  labelOpen,
  children,
}) {
  const isOpen = !!open;

  return (
    <div className={["fixed bottom-0 inset-x-0 z-40", className].filter(Boolean).join(" ")}>
      {isOpen && (
        <button
          type="button"
          aria-label="Close"
          className="fixed inset-0 bg-slate-900/30"
          onClick={() => onOpenChange?.(false)}
        />
      )}
      <div className="mx-auto max-w-screen-sm px-4 pb-4">
        <button
          type="button"
          onClick={() => onOpenChange?.(!isOpen)}
          className="w-full rounded-xl bg-white/90 backdrop-blur border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 shadow"
          style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
        >
          {isOpen ? labelOpen ?? "Close" : labelClosed ?? "Open"}
        </button>

        {isOpen && (
          <div className="mt-3 rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 p-4 max-h-[70vh] overflow-auto">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
