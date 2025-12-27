// src/components/BottomBar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../lib/learn/routing.js";
import HomeIcon from "../icons/HomeIcon.jsx";
import ProgressIcon from "../icons/ProgressIcon.jsx";
import UserIcon from "../icons/UserIcon.jsx";

/**
 * BottomBar — shared bottom navigation
 * Usage:
 *   <BottomBar active="home" />
 *   <BottomBar active="progress" />
 *   <BottomBar active="profile" />
 *
 * Props:
 *  - active: "home" | "progress" | "profile"
 */
export default function BottomBar({ active = "home" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const TabButton = ({ tabKey, label, Icon, to }) => {
    const isActive = active === tabKey;
    return (
      <button
        type="button"
        onClick={() => navigate(to, { state: { from: location.pathname } })}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        className={[
          "min-h-[44px] py-3.5 flex flex-col items-center gap-1",
          "focus:outline-none focus:ring focus:ring-emerald-300",
          isActive ? "text-slate-900 font-semibold" : "text-slate-500 hover:text-slate-900",
        ].join(" ")}
      >
        <Icon size={24} />
        <span className={isActive ? "text-xs font-semibold" : "text-xs font-medium"}>{label}</span>
      </button>
    );
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur border-t border-slate-200"
      role="navigation"
      aria-label="Primary"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-screen-sm grid grid-cols-3">
        <TabButton tabKey="progress" label="Progress" Icon={ProgressIcon} to={ROUTES.PROGRESS} />
        <TabButton tabKey="home" label="Home" Icon={HomeIcon} to={ROUTES.HOME} />
        <TabButton tabKey="profile" label="Profile" Icon={UserIcon} to={ROUTES.PROFILE} />
      </div>
    </nav>
  );
}
