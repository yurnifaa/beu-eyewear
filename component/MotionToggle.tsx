'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Pause, Play } from 'lucide-react';

const STORAGE_KEY = 'beu-motion';
const CHANGE_EVENT = 'beu-motion-change';

// Set once the visitor has used the button, so it keeps working when storage is blocked.
let choice: boolean | undefined;

// localStorage can throw (private mode, blocked storage); a failure just means "not paused".
function readPaused() {
  if (choice !== undefined) return choice;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'paused';
  } catch {
    return false;
  }
}

function subscribe(notify: () => void) {
  window.addEventListener(CHANGE_EVENT, notify);
  return () => window.removeEventListener(CHANGE_EVENT, notify);
}

// Stops the moving banners (ticker, punk band, benefits bar, orb spin) for visitors who find them
// distracting: WCAG 2.2.2 asks for a way to pause motion that lasts more than five seconds. The
// switch is a data attribute on <html> that beu-theme.css reads, and the choice is remembered.
export default function MotionToggle() {
  const paused = useSyncExternalStore(subscribe, readPaused, () => false);

  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'paused' : 'running';
  }, [paused]);

  const toggle = () => {
    choice = !paused;
    try {
      localStorage.setItem(STORAGE_KEY, choice ? 'paused' : 'running');
    } catch {
      // Storage is blocked: the choice just won't survive a reload.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={paused}
      aria-label="Pause moving banners"
      className="absolute right-0 top-0 z-10 flex h-10 w-10 cursor-pointer items-center justify-center bg-ink text-ice-mist transition-colors hover:text-ice motion-reduce:hidden"
    >
      {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
    </button>
  );
}
