'use client';

import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import Button from '@/component/Button';
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
          <legend className="text-sm font-semibold">Color</legend>
          <div className="mt-2 flex flex-wrap gap-2">
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
                  className={`flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background ${
                    variant.available <= 0 ? 'opacity-50' : ''
                  }`}
                >
                  {variant.hex && (
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-full border border-black/10"
                      style={{ backgroundColor: variant.hex }}
                    />
                  )}
                  {variant.color}
                  {variant.available <= 0 && <span className="font-normal">(sold out)</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {soldOut ? (
        <p className="text-sm font-semibold text-red-600">Out of stock</p>
      ) : (
        available <= lowStockThreshold && <p className="text-sm font-semibold text-amber-600">Only {available} left</p>
      )}

      <div>
        <p className="text-sm font-semibold">Quantity</p>
        <div className="mt-2">
          <QuantityStepper value={quantity} onChange={(next) => setQuantity(Math.min(next, Math.max(1, Math.min(available, MAX_QUANTITY))))} />
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="primary" className="uppercase" onClick={handleAddToCart} disabled={soldOut}>
          {justAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
          {soldOut ? 'Out of stock' : justAdded ? 'Added' : 'Add to Cart'}
        </Button>
        <WishlistButton slug={slug} name={name} variant="labeled" />
      </div>
    </>
  );
}
