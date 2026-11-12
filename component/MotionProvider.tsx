'use client';

import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';

// framer-motion is only used by the home page (scroll parallax) and the cart (list animations), so
// those pages wrap themselves in this instead of the whole storefront paying for it.
//
// The animation engine is loaded lazily (LazyMotion + the `m` components), in its own chunk after
// the first paint, so it never blocks a page's first render. The cart needs the bigger engine
// because its rows use layout animations (`layout` prop); everything else gets the small one.
//
// With reducedMotion="user", the OS reduced-motion setting turns transform animations into instant
// jumps while opacity fades still play.
const loadFeatures = () => import('./motion-features').then((module) => module.default);
const loadLayoutFeatures = () => import('./motion-features-layout').then((module) => module.default);

export default function MotionProvider({ children, layout = false }: { children: ReactNode; layout?: boolean }) {
  return (
    <LazyMotion features={layout ? loadLayoutFeatures : loadFeatures}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
