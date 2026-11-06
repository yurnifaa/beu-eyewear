'use client';

import { useEffect } from 'react';

// Two jobs, both done by setting a flag on <html> that app/globals.css reacts to:
//  - data-hydrated: the page's scripts have loaded. Until then CSS shows the scroll-reveal content
//    after a few seconds, so a slow connection never leaves blank sections waiting for JavaScript.
//  - data-lite: Save-Data is on, or the connection reports 2G/3G. CSS then drops the heavy extras
//    (parallax, slide-ins, blur, marquees, scroll snap). Browsers without the Network Information
//    API (Safari, Firefox) simply never get the flag and behave as before.
interface NetworkInformationLike extends EventTarget {
  saveData?: boolean;
  effectiveType?: string;
}

const SLOW_TYPES = new Set(['slow-2g', '2g', '3g']);

export default function ConnectionMode() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-hydrated', '');

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
