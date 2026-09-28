"use client";

import { useSyncExternalStore } from "react";
import { Classic } from "@/component/DLToggle";

// bottom-up reveal, matching the toggle's position in the header
const RECT_FROM = "inset(100% 0 0 0)";

type ViewTransitionDocument = Document & {
  startViewTransition(callback: () => void): { finished: Promise<void> };
};

const listeners = new Set<() => void>();

function notifyThemeChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Light is the default appearance regardless of OS preference, so the only
// thing that flips this is an explicit .dark class from a previous toggle.
function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

// SSR has no window/classList/media query to read, so the server always
// renders light. useSyncExternalStore reconciles this against the real
// client snapshot right after hydration without a mismatch warning.
function getServerSnapshot() {
  return false;
}

export default function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleClick = () => {
    const next = !isDark;
    const root = document.documentElement;

    const applyTheme = () => {
      root.classList.toggle("dark", next);
      root.classList.toggle("light", !next);
      notifyThemeChange();
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vtDocument = document as ViewTransitionDocument;

    if (reduceMotion || typeof vtDocument.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    root.style.setProperty("--theme-vt-from", RECT_FROM);
    root.dataset.themeVt = "rect";

    const transition = vtDocument.startViewTransition(applyTheme);
    transition.finished.finally(() => {
      delete root.dataset.themeVt;
    });
  };

  return (
    <Classic
      toggled={isDark}
      onClick={handleClick}
      className="inline-flex items-center justify-center text-[20px] leading-none"
    />
  );
}
