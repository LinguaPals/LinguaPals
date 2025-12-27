import React from "react";

export default function ProgressIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="10" width="3" height="11" rx="1" />
      <rect x="10.5" y="6" width="3" height="15" rx="1" />
      <rect x="18" y="2" width="3" height="19" rx="1" />
    </svg>
  );
}
