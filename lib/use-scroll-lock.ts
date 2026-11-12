'use client';

import { useEffect } from 'react';

// Shared by every overlay (login modal, mobile menu, filter sheet). The counter means two overlays
// open at once don't restore each other's "previous" values out of order.
let locks = 0;
let saved: { htmlOverflow: string; bodyOverflow: string; bodyPaddingRight: string } | null = null;

function lock() {
  if (locks++ > 0) return;
  const html = document.documentElement;
  const body = document.body;
  saved = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPaddingRight: body.style.paddingRight,
  };
  // Measure before hiding the scrollbar, then pad by the same amount so the page doesn't jump.
  const scrollbar = window.innerWidth - html.clientWidth;
  // Both elements: <html> is the real scroller here, and body alone doesn't stop it everywhere.
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

function unlock() {
  if (--locks > 0 || !saved) return;
  document.documentElement.style.overflow = saved.htmlOverflow;
  document.body.style.overflow = saved.bodyOverflow;
  document.body.style.paddingRight = saved.bodyPaddingRight;
  saved = null;
}

/** Stops the page behind an open overlay from scrolling while `locked` is true. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lock();
    return unlock;
  }, [locked]);
}
