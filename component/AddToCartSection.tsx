'use client';

import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import Button from '@/component/Button';
import QuantityStepper from '@/component/QuantityStepper';
import WishlistButton from '@/component/WishlistButton';
import { addToCart } from '@/lib/cart';
import { LOW_STOCK_THRESHOLD } from '@/lib/catalog/types';

export interface AddToCartSectionProps {
  slug: string;
  name: string;
  colors: string[];
  stockQuantity: number;
}

export default function AddToCartSection({ slug, name, colors, stockQuantity }: AddToCartSectionProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = stockQuantity <= 0;

  const handleAddToCart = () => {
    if (soldOut) return;
    addToCart(slug, quantity, selectedColor);
    setQuantity(1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <>
      {colors.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold">Color</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((color) => (
              <label key={color} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={color}
                  checked={selectedColor === color}
                  onChange={() => setSelectedColor(color)}
                  className="peer sr-only"
                />
                <span className="block rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                  {color}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {soldOut ? (
        <p className="text-sm font-semibold text-red-600">Out of stock</p>
      ) : (
        stockQuantity <= LOW_STOCK_THRESHOLD && (
          <p className="text-sm font-semibold text-amber-600">Only {stockQuantity} left</p>
        )
      )}

      <div>
        <p className="text-sm font-semibold">Quantity</p>
        <div className="mt-2">
          <QuantityStepper value={quantity} onChange={setQuantity} />
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
