'use client';

import { useRef, type ComponentType, type ReactNode, type Ref } from 'react';
import Image, { type ImageProps } from 'next/image';
import {
  LazyMotion,
  MotionConfig,
  m,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
  type UseScrollOptions,
  type Variants,
} from 'framer-motion';

// One motion language for the storefront: transform + opacity only, 300ms, ease-out, no bounce.
const DURATION = 0.3;
const EASE = 'easeOut' as const;
const STAGGER_STEP = 0.06;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
};

// Wrap the storefront once. With "user", the OS reduced-motion setting turns every transform
// animation (the slide-up in Reveal) into an instant jump while the opacity fade still plays.
//
// The animation engine itself is loaded lazily (LazyMotion + the `m` components below), so it comes
// in its own chunk after the first paint instead of blocking it on a slow connection.
const loadMotionFeatures = () => import('./motion-features').then((module) => module.default);

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadMotionFeatures}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

export interface RevealProps {
  children: ReactNode;
  className?: string;
  mode?: 'mount' | 'inView';
  delay?: number;
  // Hand the entrance to <RevealItem> children, one after another. true = 60ms between items,
  // or pass seconds. The container itself then stays put instead of fading as a block.
  stagger?: boolean | number;
}

export default function Reveal({ children, className = '', mode = 'inView', delay = 0, stagger }: RevealProps) {
  const trigger =
    mode === 'mount'
      ? { animate: stagger ? 'show' : { opacity: 1, y: 0 } }
      : {
          whileInView: stagger ? 'show' : { opacity: 1, y: 0 },
          viewport: { once: true, amount: stagger ? 0.1 : 0.15 },
        };

  if (stagger) {
    const step = typeof stagger === 'number' ? stagger : STAGGER_STEP;
    const container: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: step, delayChildren: delay } },
    };
    return (
      <m.div className={className} variants={container} initial="hidden" {...trigger}>
        {children}
      </m.div>
    );
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: mode === 'mount' ? 12 : 16 }}
      transition={{ duration: DURATION, ease: EASE, delay }}
      {...trigger}
    >
      {children}
    </m.div>
  );
}

// A piece of a staggered <Reveal>. Outside one it renders as a plain, visible div, so shared
// components (ProductCard...) never get stuck hidden on pages that don't stagger.
export function RevealItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={itemVariants}>
      {children}
    </m.div>
  );
}

interface ParallaxOptions {
  // Pixels of travel at scroll progress 0 and 1, e.g. [-20, 20]. Keep it small.
  range?: [number, number];
  offset?: UseScrollOptions['offset'];
  // Direction of travel: vertical (default) or horizontal.
  axis?: 'x' | 'y';
}

function useParallax<T extends HTMLElement>({ range = [-20, 20], offset = ['start end', 'end start'], axis = 'y' }: ParallaxOptions) {
  const ref = useRef<T>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const travel = useTransform(scrollYProgress, [0, 1], range);
  // Scroll-linked motion isn't covered by MotionConfig, so reduced motion is handled here.
  return { ref, style: reduce ? undefined : axis === 'x' ? { x: travel } : { y: travel } };
}

export function Parallax({
  children,
  className = '',
  as = 'div',
  ...options
}: ParallaxOptions & {
  children: ReactNode;
  className?: string;
  // 'span' keeps the markup valid when the wrapper sits inside a heading or paragraph.
  as?: 'div' | 'span';
}) {
  const { ref, style } = useParallax<HTMLDivElement>(options);
  if (as === 'span') {
    return (
      <m.span ref={ref as unknown as Ref<HTMLSpanElement>} className={className} style={style}>
        {children}
      </m.span>
    );
  }
  return (
    <m.div ref={ref} className={className} style={style}>
      {children}
    </m.div>
  );
}

// motion's typings for event handlers clash with next/image's DOM ones, so narrow to what we pass.
const MotionImage = m.create(Image) as unknown as ComponentType<
  Omit<ImageProps, 'style'> & { ref?: Ref<HTMLImageElement>; style?: MotionStyle }
>;

// The transform sits on the <img> itself, not a wrapper: an ancestor with a transform would
// isolate the image's mix-blend-mode from the section behind it.
export function ParallaxImage({ range, offset, ...props }: ParallaxOptions & Omit<ImageProps, 'style'>) {
  const { ref, style } = useParallax<HTMLImageElement>({ range, offset });
  return <MotionImage ref={ref} style={style} {...props} />;
}
