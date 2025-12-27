import React from "react";

export default function UserIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 7a4 4 0 10-8 0 4 4 0 008 0z" />
      <path d="M3 21a9 9 0 0118 0" />
    </svg>
  );
}
