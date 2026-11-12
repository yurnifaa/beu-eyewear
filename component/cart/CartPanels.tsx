'use client';

import type { Ref } from 'react';
import Link from 'next/link';
import { AnimatePresence, m, type Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { ResolvedCartItem } from '@/lib/cart-items';
import { itemKey, type CartModel } from './useCartModel';
import { Bead, CartThumb, GelStepper, GlossCta, RollingPrice, TrustList } from './shared';
import s from './CartPanels.module.css';

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: Math.min(index, 6) * 0.07 },
  }),
  out: { opacity: 0, x: 40, transition: { duration: 0.3, ease: 'easeOut' } },
};

// Takes `ref` as a prop: AnimatePresence (popLayout) measures the row through it.
function Row({
  item,
  index,
  model,
  onChange,
  ref,
}: {
  item: ResolvedCartItem;
  index: number;
  model: CartModel;
  onChange?: () => void;
  ref?: Ref<HTMLLIElement>;
}) {
  const key = itemKey(item);
  const selected = model.isSelected(key);
  // Lets shoppers re-check what they picked (photos, specs, sizes) before paying.
  const productHref = `/listing/${item.slug}`;

  return (
    <m.li
      ref={ref}
      layout="position"
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="show"
      exit="out"
      className={`${s.row} ${selected ? '' : s.off}`}
    >
      <div className={s.aSel}>
        <Bead
          checked={selected}
          onChange={() => {
            model.toggleItem(key);
            onChange?.();
          }}
          label={`Select ${item.name}`}
        />
      </div>

      <div className={`${s.thumb} ${s.aThumb}`}>
        <CartThumb item={item} sizes="88px" imageClassName="p-2.5" />
        {/* Whole photo is a link; the name below is the one keyboard/screen-reader stop. */}
        <Link href={productHref} aria-hidden="true" tabIndex={-1} className="absolute inset-0 z-10 rounded-full" />
      </div>

      <div className={s.aInfo}>
        <p className="font-display text-sm font-bold uppercase leading-snug tracking-tight">
          <Link
            href={productHref}
            aria-label={`View ${item.name}`}
            className="underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {item.name}
          </Link>
        </p>
        {item.color && <p className="mt-0.5 text-xs text-muted-foreground">Color: {item.color}</p>}
      </div>

      <div className={s.aQty}>
        <GelStepper
          label={item.name}
          value={item.quantity}
          max={item.available || undefined}
          onChange={(quantity) => {
            model.setQuantity(item, quantity);
            onChange?.();
          }}
        />
        {item.available > 0 && item.quantity >= item.available && (
          <p className="mt-1 text-[10px] text-amber-600">Only {item.available} left</p>
        )}
      </div>

      <div className={s.aPrice}>
        <p className="font-display text-base font-black tabular-nums">{formatPrice(item.price * item.quantity)}</p>
        {item.quantity > 1 && (
          <p className="text-xs tabular-nums text-muted-foreground">{formatPrice(item.price)} each</p>
        )}
      </div>

      <div className={`${s.aDel} justify-self-end`}>
        <button
          type="button"
          aria-label={`Remove ${item.name}`}
          onClick={() => {
            model.removeItem(item);
            onChange?.();
          }}
          className={s.iconBtn}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </m.li>
  );
}

// `onChange`, when given, is called after any edit to the list.
export function ItemsPanel({ model, onChange }: { model: CartModel; onChange?: () => void }) {
  return (
    <section aria-label="Cart items" className={`${s.panel} ${s.items}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-3 py-2.5 text-sm">
        <label className="flex cursor-pointer items-center gap-1">
          <Bead
            checked={model.allSelected}
            onChange={() => {
              model.toggleAll();
              onChange?.();
            }}
            label="Select all items"
          />
          Select All
        </label>
        <button
          type="button"
          onClick={() => {
            model.removeSelected();
            onChange?.();
          }}
          disabled={model.selectedCount === 0}
          className={s.textBtn}
        >
          Remove Selected
        </button>
      </div>

      <ul className="relative">
        <AnimatePresence mode="popLayout">
          {model.items.map((item, index) => (
            <Row key={itemKey(item)} item={item} index={index} model={model} onChange={onChange} />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

export function SummaryPanel({
  model,
  checkoutFromDesktop = false,
}: {
  model: CartModel;
  // Hide this panel's checkout button below the lg breakpoint, where a sticky bar carries it instead.
  checkoutFromDesktop?: boolean;
}) {
  return (
    <aside aria-label="Order summary" className={`${s.panel} p-6 lg:sticky lg:top-28`}>
      <h2 className="font-display text-sm font-bold uppercase tracking-tight">Order Summary</h2>
      <div className="mt-5 flex justify-between text-sm">
        <span className="text-muted-foreground">Selected Items:</span>
        <span className="tabular-nums">{model.selectedCount}</span>
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal:</span>
        <RollingPrice value={model.subtotal} />
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-sm font-bold">Total:</span>
        <RollingPrice value={model.subtotal} className="font-display text-3xl font-black tracking-tight" />
      </div>

      <div className={`mt-6 ${checkoutFromDesktop ? 'hidden lg:block' : ''}`}>
        <GlossCta href={model.checkoutHref} disabled={model.selectedCount === 0}>
          Proceed to Checkout
        </GlossCta>
      </div>

      <Link
        href="/listing"
        className="mt-3 block py-2 text-center text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Continue Shopping
      </Link>

      <TrustList className="mt-3 border-t border-border pt-4 text-muted-foreground" />
    </aside>
  );
}
