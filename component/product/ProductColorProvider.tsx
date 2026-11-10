'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { initialColor, STANDARD_COLOR } from '@/lib/catalog/variants';

export interface ProductColorVariant {
  color: string;
  available: number;
  // This color's photos in display order; empty shows the gallery placeholders.
  images: string[];
}

interface ProductColorValue {
  selectedColor: string | undefined;
  selectColor: (color: string) => void;
  // What the gallery shows for the selected color. `key` changes with the color, so the gallery
  // restarts at the first photo whenever the shopper picks a different one.
  gallery: { images: string[]; key: string };
}

const ProductColorContext = createContext<ProductColorValue | null>(null);

// Holds the selected color for the product page, so the gallery (left column) and the color
// swatches (right column) stay in step.
export default function ProductColorProvider({ variants, children }: { variants: ProductColorVariant[]; children: ReactNode }) {
  const [selectedColor, selectColor] = useState(() => initialColor(variants));

  const value = useMemo<ProductColorValue>(() => {
    // A single-option product ("Standard") has no swatch to pick, so its one option is the one shown.
    const shown =
      variants.find((variant) => variant.color === selectedColor) ??
      variants.find((variant) => variant.color === STANDARD_COLOR) ??
      variants[0];
    return {
      selectedColor,
      selectColor,
      gallery: { images: shown?.images ?? [], key: `color:${shown?.color ?? ''}` },
    };
  }, [variants, selectedColor]);

  return <ProductColorContext.Provider value={value}>{children}</ProductColorContext.Provider>;
}

export function useProductColor(): ProductColorValue {
  const value = useContext(ProductColorContext);
  if (!value) throw new Error('useProductColor must be used inside ProductColorProvider');
  return value;
}
