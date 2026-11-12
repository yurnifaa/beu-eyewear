'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, animate, m, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { ArrowRight, Check, Minus, Plus } from 'lucide-react';
import PixelGlyph, { type GlyphName } from '@/component/beu/PixelGlyph';
import ProductImage from '@/component/ProductImage';
import type { ResolvedCartItem } from '@/lib/cart-items';
import { formatPrice } from '@/lib/format';
import s from './shared.module.css';

// ---------- numbers ----------

// A price that counts to its new value instead of jumping. The animated text is hidden from
// assistive tech (it would read every in-between number); the final value is always in the DOM.
export function RollingPrice({ value, className = '' }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, (latest) => formatPrice(Math.round(latest)));

  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return;
    }
    // Short on purpose: it runs on every tick of a quantity or checkbox, and a long count-up makes
    // the total look like it is lagging behind the click.
    const controls = animate(motionValue, value, { duration: 0.25, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, reduce, motionValue]);

  return (
    <span className={`tabular-nums ${className}`}>
      <m.span aria-hidden="true">{text}</m.span>
      <span className="sr-only">{formatPrice(value)}</span>
    </span>
  );
}

// ---------- ornament ----------

interface DriftGlyph {
  name: GlyphName;
  left: string;
  top: string;
  size: number;
  tone: 'accent' | 'ice' | 'white';
  dur: number;
  delay: number;
  dx: number;
  dy: number;
  rot: number;
}

// Fixed positions, so the field is the same on every visit and never shifts on hydration.
const DRIFT: DriftGlyph[] = [
  { name: 'spark', left: '4%', top: '18%', size: 30, tone: 'accent', dur: 9, delay: 0, dx: 8, dy: -22, rot: 14 },
  { name: 'star5', left: '92%', top: '12%', size: 26, tone: 'white', dur: 11, delay: -3, dx: -10, dy: 18, rot: -18 },
  { name: 'cross', left: '14%', top: '62%', size: 20, tone: 'ice', dur: 8, delay: -2, dx: 12, dy: -14, rot: 20 },
  { name: 'burst', left: '86%', top: '58%', size: 34, tone: 'ice', dur: 12, delay: -6, dx: -8, dy: -20, rot: 12 },
  { name: 'spark-o', left: '48%', top: '6%', size: 22, tone: 'white', dur: 10, delay: -4, dx: 14, dy: 12, rot: -10 },
  { name: 'bolt', left: '70%', top: '86%', size: 24, tone: 'accent', dur: 9.5, delay: -1, dx: -12, dy: -16, rot: 16 },
  { name: 'heart', left: '30%', top: '90%', size: 22, tone: 'white', dur: 11.5, delay: -5, dx: 10, dy: -18, rot: -14 },
];

const TONE_COLOR: Record<DriftGlyph['tone'], string> = {
  accent: 'var(--accent)',
  ice: 'var(--ice)',
  white: '#ffffff',
};

// Pixel glyphs drifting slowly behind an Ice Sky page. Decorative; held still under reduced motion.
export function GlyphDrift() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {DRIFT.map((glyph) => (
        <span
          key={glyph.name}
          className={s.glyph}
          style={
            {
              left: glyph.left,
              top: glyph.top,
              color: TONE_COLOR[glyph.tone],
              opacity: 0.8,
              '--dur': `${glyph.dur}s`,
              '--delay': `${glyph.delay}s`,
              '--dx': `${glyph.dx}px`,
              '--dy': `${glyph.dy}px`,
              '--rot': `${glyph.rot}deg`,
            } as CSSProperties
          }
        >
          <PixelGlyph name={glyph.name} size={glyph.size} />
        </span>
      ))}
    </div>
  );
}

// ---------- controls ----------

// The selection checkbox. A real input sits on top (44px hit area, keyboard and screen reader
// intact); the bead is only its face.
export function Bead({
  checked,
  onChange,
  label,
  className = '',
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}) {
  return (
    <label className={`${s.bead} ${className}`}>
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} className={s.beadInput} />
      <span className={s.beadFace} aria-hidden="true">
        <Check size={16} strokeWidth={3} className={s.check} />
      </span>
    </label>
  );
}

const rollVariants = {
  enter: (dir: number) => ({ y: dir * 14, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir * -14, opacity: 0 }),
};

// Quantity stepper. The number rolls up when it grows and down when it shrinks.
export function GelStepper({
  value,
  onChange,
  label,
  max,
  className = '',
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
  max?: number;
  className?: string;
}) {
  const [dir, setDir] = useState(1);

  const step = (next: number) => {
    setDir(next > value ? 1 : -1);
    onChange(next);
  };

  return (
    <div role="group" aria-label={`Quantity of ${label}`} className={`${s.stepper} ${className}`}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => step(value - 1)}
        className={s.stepBtn}
      >
        <Minus size={14} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <span className={s.stepVal} aria-live="polite" aria-atomic="true">
        <AnimatePresence initial={false} custom={dir}>
          <m.span
            key={value}
            custom={dir}
            variants={rollVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 grid place-items-center tabular-nums"
          >
            {value}
          </m.span>
        </AnimatePresence>
      </span>
      <button type="button" aria-label="Increase quantity" disabled={max !== undefined && value >= max} onClick={() => step(value + 1)} className={s.stepBtn}>
        <Plus size={14} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
}

// The signature gloss pill. Exactly one per view.
export function GlossCta({
  href,
  disabled = false,
  children,
  compact = false,
  className = '',
}: {
  href?: string;
  disabled?: boolean;
  children: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  const classes = `beu-gloss ${s.cta} inline-flex items-center justify-center gap-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] ${
    compact ? 'h-11 px-5' : 'h-12 w-full px-7'
  } ${className}`;
  if (disabled || !href) {
    return (
      <button type="button" disabled className={classes}>
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}

// ---------- trust ----------

// Facts from the brand brief, stated where the buyer decides.
const TRUST: { glyph: GlyphName; text: string }[] = [
  { glyph: 'star5', text: 'Free case and microfiber cloth with every order' },
  { glyph: 'heart', text: '7-day free return' },
  { glyph: 'bolt', text: '1-year warranty, 5 years on smart glasses' },
];

export function TrustList({
  className = '',
  glyphClassName = 'text-accent',
}: {
  className?: string;
  glyphClassName?: string;
}) {
  return (
    <ul className={`grid gap-2 text-xs ${className}`}>
      {TRUST.map((fact) => (
        <li key={fact.text} className="flex items-start gap-2.5">
          <PixelGlyph name={fact.glyph} size={14} className={`mt-px shrink-0 ${glyphClassName}`} />
          <span>{fact.text}</span>
        </li>
      ))}
    </ul>
  );
}

// ---------- loading ----------

export function CartSkeleton({ rows = 2, className = '' }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-label="Loading your cart" className={`grid gap-4 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={`${s.skel} h-36`} />
      ))}
    </div>
  );
}

// ---------- product thumbnail ----------

const FRAME_SHAPES = ['g-round', 'g-wrap', 'g-shield', 'g-rect', 'g-butterfly'];

// The product photo, or, while a product has none, one of the brand's own frame drawings picked
// from its slug (so a given product always shows the same frame).
export function CartThumb({
  item,
  sizes,
  imageClassName = '',
}: {
  item: ResolvedCartItem;
  sizes: string;
  imageClassName?: string;
}) {
  if (item.imageUrl) {
    return (
      <ProductImage
        imageUrl={item.imageUrl}
        alt={item.name}
        sizes={sizes}
        objectFit="contain"
        className="absolute inset-0 h-full w-full border-0! bg-transparent!"
        imageClassName={imageClassName}
      />
    );
  }

  let hash = 0;
  for (const char of item.slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;

  return (
    <svg viewBox="0 0 240 100" aria-hidden="true" className="absolute inset-0 m-auto h-auto w-[78%] text-ink">
      <use href={`#${FRAME_SHAPES[hash % FRAME_SHAPES.length]}`} />
    </svg>
  );
}
