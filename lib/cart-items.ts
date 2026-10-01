'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { CartLine } from '@/lib/cart';
import type { Product } from '@/lib/catalog/types';

export interface ResolvedCartItem extends CartLine {
  name: string;
  price: number;
}

const noopSubscribe = () => () => {};

// The cart only stores slug/color/quantity in localStorage, so names and prices
// are looked up from the catalog. These prices are for display only — the
// server re-reads them when an order is placed.
//
// `ready` is false until the cart has been read from localStorage (it is empty
// during SSR) and the product lookup for the current lines has finished, so
// callers can show a loading state instead of flashing "empty".
export function useResolvedCartItems(lines: CartLine[]): { items: ResolvedCartItem[]; ready: boolean } {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const slugsKey = [...new Set(lines.map((line) => line.slug))].sort().join(',');

  useEffect(() => {
    const slugs = slugsKey ? slugsKey.split(',') : [];
    if (slugs.length === 0) return;

    let cancelled = false;

    fetch('/api/products/by-slugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then((res) => res.json())
      .then((data: { products: Product[] }) => {
        if (cancelled) return;
        setProducts(Object.fromEntries((data.products ?? []).map((product) => [product.slug, product])));
        setLoadedKey(slugsKey);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts({});
        setLoadedKey(slugsKey);
      });

    return () => {
      cancelled = true;
    };
  }, [slugsKey]);

  const items = lines
    .map((line) => {
      const product = products[line.slug];
      if (!product) return null;
      return { ...line, name: product.name, price: product.price };
    })
    .filter((item): item is ResolvedCartItem => item !== null);

  const ready = hydrated && (slugsKey === '' || loadedKey === slugsKey);

  return { items, ready };
}
