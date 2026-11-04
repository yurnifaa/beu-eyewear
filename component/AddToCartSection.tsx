'use client';

import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import QuantityStepper from '@/component/QuantityStepper';
import WishlistButton from '@/component/WishlistButton';
import { addToCart } from '@/lib/cart';
import { LOW_STOCK_THRESHOLD } from '@/lib/catalog/types';

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

export default function AddToCartSection({ slug, name, variants, lowStockThreshold = LOW_STOCK_THRESHOLD }: AddToCartSectionProps) {
  const colored = variants.filter((variant) => variant.color !== 'Standard');
  const firstInStock = colored.find((variant) => variant.available > 0) ?? colored[0];
  const [selectedColor, setSelectedColor] = useState(firstInStock?.color);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selected = variants.find((variant) => variant.color === selectedColor) ?? variants[0];
  const available = selected?.available ?? 0;
  const soldOut = available <= 0;

  const handleAddToCart = () => {
    if (soldOut) return;
    addToCart(slug, Math.min(quantity, available), selectedColor);
    setQuantity(1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
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
              <label key={variant.color} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={variant.color}
                  checked={selectedColor === variant.color}
                  onChange={() => {
                    setSelectedColor(variant.color);
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
                  {variant.color}
                  {variant.available <= 0 && <span className="normal-case opacity-70">(sold out)</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {soldOut ? (
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-red-600/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-red-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
          Out of stock
        </p>
      ) : (
        available <= lowStockThreshold && (
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-amber-800">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            Only {available} left
          </p>
        )
      )}

      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Quantity</p>
        <div className="mt-3">
          <QuantityStepper value={quantity} onChange={(next) => setQuantity(Math.min(next, Math.max(1, Math.min(available, MAX_QUANTITY))))} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={soldOut}
          className="inline-flex h-14 min-w-48 flex-1 items-center justify-center gap-2.5 rounded-full bg-ink px-8 text-xs uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(10,26,47,0.28)] transition duration-150 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:flex-none"
        >
          {justAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
          {soldOut ? 'Out of stock' : justAdded ? 'Added' : 'Add to Cart'}
        </button>
        <WishlistButton slug={slug} name={name} variant="labeled" />
      </div>
    </>
  );
}
