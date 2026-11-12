'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

// One motion language for the storefront: opacity + a small slide, 300ms, ease-out, no bounce.
//
// The rule that matters: nothing is hidden in the server HTML. A reveal that starts at opacity 0
// makes the page blank until JavaScript has loaded and hydrated, which is what made the site feel
// slow, and the main product photo can't count as "loaded" while its container is invisible.
// So content always arrives visible, and the animation is added on top:
//
//  - mode="mount" is a pure CSS animation (.beu-enter in globals.css). It plays as the page paints,
//    needs no JavaScript, and cannot leave anything hidden.
//  - mode="inView" (the default, for sections further down the page) is visible in the HTML too.
//    After hydration, a section that starts below the fold is hidden and then faded in as it nears
//    the screen. A section that is already on screen is left alone. The styles are
//    [data-reveal] in globals.css.
//
// No animation library is needed for either, so most pages don't ship one.

export interface RevealProps {
  children: ReactNode;
  className?: string;
  mode?: 'mount' | 'inView';
  // Seconds to wait before the entrance starts.
  delay?: number;
  // inView only. Hand the entrance to <RevealItem> children, one after another, instead of fading
  // the container as a block. true = 60ms between items, or pass seconds.
  stagger?: boolean | number;
}

// How far below the screen a section can be and still start fading in (px), so a quick scroll
// doesn't catch it half-hidden.
const LEAD_PX = 120;

export default function Reveal({ children, className = '', mode = 'inView', delay = 0, stagger }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = mode === 'inView';

  useEffect(() => {
    const element = ref.current;
    if (!inView || !element || typeof IntersectionObserver === 'undefined') return;

    // Already on screen, or scrolled past: leave it showing.
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.setAttribute('data-reveal', 'hidden');
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        element.setAttribute('data-reveal', 'shown');
        observer.disconnect();
      },
      { rootMargin: `0px 0px ${LEAD_PX}px 0px` },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      // Never leave a section hidden behind an observer that is gone.
      element.removeAttribute('data-reveal');
    };
  }, [inView]);

  const style: CSSProperties & Record<`--${string}`, string> = {};
  if (delay) style['--reveal-delay'] = `${delay}s`;
  if (typeof stagger === 'number') style['--reveal-step'] = `${stagger}s`;

  if (!inView) {
    return (
      <div className={`beu-enter ${className}`} style={delay ? { animationDelay: `${delay}s` } : undefined}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className} data-stagger={stagger ? '' : undefined} style={style}>
      {children}
    </div>
  );
}

// A piece of a staggered <Reveal>. Outside one it is a plain, visible div, so shared components
// (ProductCard...) never get stuck hidden on pages that don't stagger. Its place among its siblings
// sets its turn (see .beu-item in globals.css).
export function RevealItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`beu-item ${className}`}>{children}</div>;
}
