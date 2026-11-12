'use client';

import { useRef, type ComponentType, type ReactNode, type Ref } from 'react';
import Image, { type ImageProps } from 'next/image';
import { m, useReducedMotion, useScroll, useTransform, type MotionStyle, type UseScrollOptions } from 'framer-motion';

// Scroll-linked drift for the home page's decorative layers. This is the only thing on the storefront
// that still needs framer-motion besides the cart, which is why it lives apart from Reveal: pages
// that import Reveal don't pay for the animation library. It must sit inside a <MotionProvider>
// (the renderer that makes `m` components follow scroll comes from there).
//
// On phones the movement is switched off in CSS (.beu-parallax in globals.css): the layers are
// expensive to repaint on every scroll frame and the effect is barely visible on a small screen.

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
  const classes = `beu-parallax ${className}`;
  if (as === 'span') {
    return (
      <m.span ref={ref as unknown as Ref<HTMLSpanElement>} className={classes} style={style}>
        {children}
      </m.span>
    );
  }
  return (
    <m.div ref={ref} className={classes} style={style}>
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
export function ParallaxImage({ range, offset, className = '', ...props }: ParallaxOptions & Omit<ImageProps, 'style'>) {
  const { ref, style } = useParallax<HTMLImageElement>({ range, offset });
  return <MotionImage ref={ref} style={style} className={`beu-parallax ${className}`} {...props} />;
}
