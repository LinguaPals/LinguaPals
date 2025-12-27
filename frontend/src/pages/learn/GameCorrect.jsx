// src/pages/GameCorrect.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/learn/logo.png";
import { ROUTES } from "../../lib/learn/routing.js";

export default function GameCorrect() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const nextRoute = state?.nextRoute || ROUTES.ANSWER_MC; // respect caller's intent

  const handleContinue = () => navigate(nextRoute, { state, replace: true });

  return (
    <button
      type="button"
      onClick={handleContinue}
      className="min-h-screen w-full bg-gradient-to-b from-[#F7FBFF] to-[#F9FAFB] flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-screen-sm rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 px-5 pt-6 pb-16 text-center">
        <div className="mx-auto mb-6 inline-block rounded-2xl bg-amber-400 px-6 py-4">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-wide text-slate-900">CORRECT!</span>
        </div>

        <div className="mx-auto mb-6 flex items-center justify-center">
          <svg width="220" height="70" viewBox="0 0 220 70" fill="none" className="text-slate-800/90" aria-hidden="true">
            {[
              { x: 20, y: 40, s: 10 },
              { x: 55, y: 25, s: 7 },
              { x: 85, y: 40, s: 14 },
              { x: 120, y: 28, s: 8 },
              { x: 150, y: 45, s: 16 },
              { x: 185, y: 30, s: 9 },
              { x: 205, y: 45, s: 7 },
            ].map((star, i) => (
              <polygon
                key={i}
                points={`${star.x},${star.y - star.s}
                        ${star.x + star.s * 0.35},${star.y - star.s * 0.35}
                        ${star.x + star.s},${star.y}
                        ${star.x + star.s * 0.35},${star.y + star.s * 0.35}
                        ${star.x},${star.y + star.s}
                        ${star.x - star.s * 0.35},${star.y + star.s * 0.35}
                        ${star.x - star.s},${star.y}
                        ${star.x - star.s * 0.35},${star.y - star.s * 0.35}`}
                className="fill-slate-900"
                opacity="0.95"
              />
            ))}
          </svg>
        </div>

        <div className="mx-auto">
          <img src={logo} alt="Celebrating mascot" className="mx-auto h-56 w-56 object-contain drop-shadow-sm" />
        </div>

        <p className="absolute inset-x-0 bottom-4 text-center text-xs font-medium text-slate-400">
          Tap anywhere to continue
        </p>
      </div>
    </button>
  );
}
