'use client';

import { useEffect } from 'react';

// Sets data-lite on <html> when Save-Data is on or the connection reports 2G/3G; app/globals.css then
// drops the heavy extras (parallax, slide-ins, blur, marquees, scroll snap). Browsers without the
// Network Information API (Safari, Firefox) never get the flag; the phone rules in globals.css
// (touch screens and narrow windows) cover them.
interface NetworkInformationLike extends EventTarget {
  saveData?: boolean;
  effectiveType?: string;
}

const SLOW_TYPES = new Set(['slow-2g', '2g', '3g']);

export default function ConnectionMode() {
  useEffect(() => {
    const root = document.documentElement;

    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    if (!connection) return;

    const update = () => {
      const lite = Boolean(connection.saveData) || SLOW_TYPES.has(connection.effectiveType ?? '');
      if (lite) root.setAttribute('data-lite', '');
      else root.removeAttribute('data-lite');
    };
    update();
    connection.addEventListener('change', update);
    return () => {
      connection.removeEventListener('change', update);
      root.removeAttribute('data-lite');
    };
  }, []);

  return null;
}
