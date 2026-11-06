'use client';

import type { ReactNode } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import Breadcrumb from '@/component/Breadcrumb';
import PixelGlyph from '@/component/beu/PixelGlyph';
import SectionLabel from '@/component/SectionLabel';
import { formatPrice } from '@/lib/format';
import { useCartModel } from './useCartModel';
import { CartSkeleton, GlossCta, GlyphDrift, RollingPrice } from './shared';
import { ItemsPanel, SummaryPanel } from './CartPanels';
import s from './CartLens.module.css';

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function EmptyCart() {
  return (
    <div className="mx-auto max-w-lg py-14 text-center">
      <div className={s.emptyLens}>
        <PixelGlyph name="spark" size={44} className="text-accent" />
      </div>
      <h2 className="mt-8 font-display text-2xl font-black uppercase tracking-tight">Nothing in here yet</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        Pick a frame and it lands here. Every order comes with a free case and microfiber cloth.
      </p>
      <div className="mx-auto mt-7 max-w-xs">
        <GlossCta href="/listing">Browse frames</GlossCta>
      </div>
    </div>
  );
}

// The product lookup failed (a dropped connection, say) and nothing was saved from last time. Saying
// "empty" here would be wrong, so offer another try.
function CartLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-lg py-14 text-center">
      <h2 className="font-display text-2xl font-black uppercase tracking-tight">Couldn&apos;t load your cart</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
        Your items are still saved. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="beu-gloss mt-7 inline-flex h-12 items-center rounded-full px-7 text-xs font-medium uppercase tracking-[0.14em]"
      >
        Try again
      </button>
    </div>
  );
}

export default function CartLens({ recommendations }: { recommendations: ReactNode }) {
  const model = useCartModel();
  const reduce = useReducedMotion();
  const empty = model.ready && !model.error && model.items.length === 0;

  return (
    <div className="relative isolate overflow-clip">
      <div aria-hidden="true" className={`${s.sky} absolute inset-0 -z-10`} />
      <div aria-hidden="true" className="beu-hero-grid absolute inset-0 -z-10 opacity-70" />
      <GlyphDrift />

      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-6 sm:px-8">
        <Breadcrumb items={[{ label: 'Home', href: '/home' }, { label: 'Cart' }]} />

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <h1 className="beu-chrome-text font-display text-[clamp(3.5rem,13vw,6rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
            <span className="sr-only">Shopping </span>Cart
          </h1>
          {model.ready && model.totalUnits > 0 && (
            <m.span
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              className={s.countBead}
              role="img"
              aria-label={`${model.totalUnits} ${model.totalUnits === 1 ? 'item' : 'items'} in your cart`}
            >
              <span aria-hidden="true" className="font-display text-xl font-black tabular-nums">
                {model.totalUnits}
              </span>
            </m.span>
          )}
          <p className="font-accent -rotate-2 text-3xl text-accent sm:text-4xl">
            {empty ? 'start here.' : 'almost yours.'}
          </p>
        </div>

        <div role="status" className="sr-only">
          {model.ready ? `${model.selectedCount} selected, total ${formatPrice(model.subtotal)}` : 'Loading your cart'}
        </div>

        {!model.ready ? (
          <CartSkeleton className="mt-8 max-w-4xl" rows={2} />
        ) : model.error ? (
          <CartLoadError onRetry={model.retry} />
        ) : empty ? (
          <EmptyCart />
        ) : (
          <div className="mt-8">
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
              <ItemsPanel model={model} />

              <SummaryPanel model={model} checkoutFromDesktop />
            </div>

            <div className={s.bar}>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total ({model.selectedCount})</p>
                <RollingPrice
                  value={model.subtotal}
                  className="font-display text-lg font-black leading-none tracking-tight"
                />
              </div>
              <GlossCta compact href={model.checkoutHref} disabled={model.selectedCount === 0}>
                Checkout
              </GlossCta>
            </div>
          </div>
        )}

        <div className="mt-16">
          <SectionLabel>You May Also Like</SectionLabel>
          <div className="mt-8">{recommendations}</div>
        </div>
      </div>
    </div>
  );
}
