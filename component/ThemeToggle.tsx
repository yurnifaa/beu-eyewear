"use client";

import { useSyncExternalStore } from "react";
import { Classic } from "@/component/DLToggle";

// bottom-up reveal, matching the toggle's position in the header
const RECT_FROM = "inset(100% 0 0 0)";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

type ViewTransitionDocument = Document & {
  startViewTransition(callback: () => void): { finished: Promise<void> };
};

const listeners = new Set<() => void>();

function notifyThemeChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const mql = window.matchMedia(MEDIA_QUERY);
  mql.addEventListener("change", notifyThemeChange);
  return () => {
    listeners.delete(callback);
    mql.removeEventListener("change", notifyThemeChange);
  };
}

// Reads an already-applied .dark/.light class (from a previous manual
// toggle) or falls back to the OS preference.
function getSnapshot() {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia(MEDIA_QUERY).matches;
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
