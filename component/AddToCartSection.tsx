'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShoppingBag } from 'lucide-react';
import { useProductColor } from '@/component/product/ProductColorProvider';
import QuantityStepper from '@/component/QuantityStepper';
import WishlistButton from '@/component/WishlistButton';
import { addToCart } from '@/lib/cart';
import { flyToCart, shouldReduceMotion } from '@/lib/cart-fly';
import { LOW_STOCK_THRESHOLD } from '@/lib/catalog/types';
import { STANDARD_COLOR } from '@/lib/catalog/variants';

export interface AddToCartVariant {
  color: string;
  hex?: string;
  available: number;
}

export interface AddToCartSectionProps {
  slug: string;
  name: string;
  // One entry per sellable color, with its own live stock. "Standard" means a single option.
  variants: AddToCartVariant[];
  lowStockThreshold?: number;
}

const MAX_QUANTITY = 99;
// How long the landed badge is shown before moving on to /cart.
const LAND_PAUSE_MS = 250;

export default function AddToCartSection({ slug, name, variants, lowStockThreshold = LOW_STOCK_THRESHOLD }: AddToCartSectionProps) {
  const colored = variants.filter((variant) => variant.color !== STANDARD_COLOR);
  // The selected color lives in the page's color provider so the photo gallery can follow it.
  const { selectedColor, selectColor } = useProductColor();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const selected = variants.find((variant) => variant.color === selectedColor) ?? variants[0];
  const available = selected?.available ?? 0;
  const soldOut = available <= 0;

  // Warm the cart page so the redirect after the animation is quick.
  useEffect(() => {
    router.prefetch('/cart');
  }, [router]);

  // Sequence: chip flies to the header cart -> item is added as it lands (badge ticks + icon bumps)
  // -> a beat to see it -> go to the cart. The button stays locked throughout so a double-click
  // can't add twice. With reduced motion / lite mode flyToCart returns at once and the pause is skipped.
  const handleAddToCart = async () => {
    if (soldOut || addingRef.current) return;
    addingRef.current = true;
    setAdding(true);

    const added = Math.min(quantity, available);
    const animate = !shouldReduceMotion();
    if (buttonRef.current) await flyToCart({ from: buttonRef.current, label: `+${added}` });

    addToCart(slug, added, selectedColor);
    setAdding(false);
    setJustAdded(true);

    if (animate) await new Promise((resolve) => window.setTimeout(resolve, LAND_PAUSE_MS));
    router.push('/cart');
  };

  return (
    <>
      {colored.length > 0 && (
        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Color — <span className="text-foreground">{selected?.color}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {colored.map((variant) => (
              <label key={variant.color} className={variant.available <= 0 ? 'cursor-not-allowed' : 'cursor-pointer'}>
                <input
                  type="radio"
                  name="color"
                  value={variant.color}
                  checked={selectedColor === variant.color}
                  disabled={variant.available <= 0}
                  onChange={() => {
                    selectColor(variant.color);
                    setQuantity(1);
                  }}
                  className="peer sr-only"
                />
                <span
                  className={`beu-chip flex h-11 items-center gap-2.5 px-4 text-xs uppercase tracking-[0.1em] peer-checked:!border-ink peer-checked:!bg-ink peer-checked:!text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                    variant.available <= 0 ? 'opacity-50' : ''
                  }`}
                >
                  {variant.hex && (
                    <span
                      aria-hidden="true"
                      className="size-3.5 rounded-full border border-black/15"
                      style={{ backgroundColor: variant.hex }}
                    />
                  )}
                  <span className={variant.available <= 0 ? 'line-through' : undefined}>{variant.color}</span>
                  {variant.available <= 0 && <span className="normal-case opacity-70">(sold out)</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div aria-live="polite" className="w-fit">
        {soldOut ? (
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-red-600/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-red-700">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            Out of stock
          </p>
        ) : available <= lowStockThreshold ? (
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-amber-800">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            Only {available} left
          </p>
        ) : (
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-ice-mist px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {available} in stock
          </p>
        )}
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Quantity</p>
        <div className="mt-3">
          <QuantityStepper
            value={quantity}
            max={Math.max(1, Math.min(available, MAX_QUANTITY))}
            disabled={soldOut}
            onChange={(next) => setQuantity(Math.min(next, Math.max(1, Math.min(available, MAX_QUANTITY))))}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut || adding}
          className="inline-flex h-14 min-w-48 flex-1 items-center justify-center gap-2.5 rounded-full bg-ink px-8 text-xs uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(10,26,47,0.28)] transition duration-150 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:flex-none"
        >
          {justAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
          {soldOut ? 'Out of stock' : adding ? 'Adding…' : justAdded ? 'Added' : 'Add to Cart'}
        </button>
        <WishlistButton slug={slug} name={name} variant="labeled" />
      </div>
    </>
  );
}
