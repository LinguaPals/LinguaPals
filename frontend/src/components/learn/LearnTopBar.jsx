// src/components/HeaderBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../lib/learn/routing.js";

import HomeIcon from "../icons/HomeIcon.jsx";
import ChevronLeft from "../icons/ChevronLeft.jsx";
import CogIcon from "../icons/CogIcon.jsx";
import FilterIcon from "../icons/FilterIcon.jsx";

import logo from "../../assets/learn/logo.png";

/**
 * Unified app header:
 *  - Left:    "home" | "back" | "none"  (default "home")
 *  - Center:  Brand (logo + "Just Language") — always visible
 *  - Right:   "cog" | "filter" | "none" (default "cog"), OR pass a custom `rightSlot`
 *
 * Props:
 * - left?: "home" | "back" | "none"         (default "home")
 * - right?: "cog" | "filter" | "none"       (default "cog")
 * - onRightClick?: () => void               (open settings/filter sheet)
 * - onLeftClick?: () => void                (override left action if needed)
 * - rightSlot?: ReactNode                   (custom replaces standard right icon; e.g., upgrade button on Home)
 * - sticky?: boolean                        (default true)
 * - showAccent?: boolean                    (render thin accent bar under header; e.g., on game pages)
 * - className?: string
 *
 * Accessibility:
 *  - Buttons have aria-labels and 44px min hit area
 *  - Focus rings visible
 */
export default function HeaderBar({
  left = "home",
  right = "cog",
  onRightClick,
  onLeftClick,
  rightSlot,
  sticky = true,
  showAccent = false,
  className = "",
}) {
  const navigate = useNavigate();

  const handleLeft = () => {
    if (onLeftClick) return onLeftClick();
    if (left === "home") return navigate(ROUTES.HOME);
    if (left === "back") {
      if (window.history.length > 1) return navigate(-1);
      return navigate(ROUTES.HOME);
    }
    return undefined;
  };

  const renderLeft = () => {
    if (left === "none") return <div className="w-10 h-10" />;
    const Icon = left === "back" ? ChevronLeft : HomeIcon;
    const label = left === "back" ? "Go back" : "Go home";
    return (
      <button
        type="button"
        onClick={handleLeft}
        aria-label={label}
        className="p-2 rounded-xl focus:outline-none focus:ring focus:ring-emerald-300 min-w-10 min-h-10"
      >
        <Icon size={24} />
      </button>
    );
  };

  const renderBrand = () => (
    <div className="flex items-center gap-2 select-none">
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        className="w-5 h-5 rounded-sm"
        draggable="false"
      />
      <span className="text-sm font-semibold tracking-tight">Just Language</span>
    </div>
  );

  const renderRight = () => {
    if (rightSlot) return rightSlot;
    if (right === "none") return <div className="w-10 h-10" />;
    const Icon = right === "filter" ? FilterIcon : CogIcon;
    const label = right === "filter" ? "Open filters" : "Open settings";
    return (
      <button
        type="button"
        onClick={onRightClick}
        aria-label={label}
        className="p-2 rounded-xl focus:outline-none focus:ring focus:ring-emerald-300 min-w-10 min-h-10"
      >
        <Icon size={24} />
      </button>
    );
  };

  return (
    <div
      className={[
        sticky ? "sticky top-0 z-40" : "",
        "bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70",
        "border-b border-slate-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mx-auto max-w-screen-sm px-4">
        <header className="h-14 flex items-center justify-between">
          {renderLeft()}
          {renderBrand()}
          {renderRight()}
        </header>
      </div>
      {showAccent && <div className="h-0.5 bg-emerald-500" />}
    </div>
  );
}
