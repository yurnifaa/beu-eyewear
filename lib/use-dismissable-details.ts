'use client';

import { useCallback, useEffect, useRef } from 'react';

// For a native <details> used as a dropdown: it gives you keyboard and screen-reader support and works
// before hydration, and this adds what <details> lacks: closing on an outside tap and on Escape (focus
// goes back to the summary). Because tapping another dropdown counts as "outside", only one is ever
// open at a time. `close` is for closing after an option is picked.
export function useDismissableDetails() {
  const ref = useRef<HTMLDetailsElement>(null);

  const close = useCallback(() => {
    if (ref.current) ref.current.open = false;
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const details = ref.current;
      if (details?.open && !details.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const details = ref.current;
      if (event.key === 'Escape' && details?.open) {
        close();
        details.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [close]);

  return { ref, close };
}
