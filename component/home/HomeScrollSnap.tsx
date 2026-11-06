'use client';

import { useEffect } from 'react';

// Turns on the home page's gentle section snap (see .beu-snap in app/globals.css) while this page
// is mounted. The class lives on <html> because the document is the scroller, and it is removed on
// the way out so other pages scroll normally.
export default function HomeScrollSnap() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('beu-snap');
    return () => root.classList.remove('beu-snap');
  }, []);

  return null;
}
