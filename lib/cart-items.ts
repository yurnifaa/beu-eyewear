'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { CartLine } from '@/lib/cart';
import type { Product } from '@/lib/catalog/types';

export interface ResolvedCartItem extends CartLine {
  name: string;
  price: number;
  imageUrl?: string;
}

const noopSubscribe = () => () => {};

// The last product details we looked up, kept on the device. The cart paints from this copy straight
// away on a repeat visit and refreshes it in the background, so a slow connection doesn't mean an
// empty-looking cart. Only the slugs currently in the cart are kept, which keeps it small.
const CACHE_KEY = 'beu:cart-products:v1';

function readCachedProducts(): Record<string, Product> {
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? '{}') as Record<string, Product>;
  } catch {
    return {};
  }
}

function writeCachedProducts(products: Record<string, Product>) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(products));
  } catch {
    // Storage full or blocked: the cart still works, it just won't be remembered.
  }
}

// The cart only stores slug/color/quantity in localStorage, so names and prices
// are looked up from the catalog. These prices are for display only — the
// server re-reads them when an order is placed.
//
// `ready` is false until the cart has been read from localStorage (it is empty
// during SSR) and the product lookup for the current lines has finished, so
// callers can show a loading state instead of flashing "empty".
//
// `error` is true when the lookup failed and there was no saved copy to fall back on. The cart then
// shows a retry instead of pretending to be empty; `retry` tries the lookup again.
export function useResolvedCartItems(lines: CartLine[]): {
  items: ResolvedCartItem[];
  ready: boolean;
  error: boolean;
  retry: () => void;
} {
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
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

    // Show the saved copy first (when it covers every line), then refresh from the server.
    const saved = readCachedProducts();
    const hasSavedCopy = slugs.every((slug) => saved[slug]);
    if (hasSavedCopy) {
      queueMicrotask(() => {
        if (cancelled) return;
        setProducts(Object.fromEntries(slugs.map((slug) => [slug, saved[slug]])));
        setLoadedKey(slugsKey);
      });
    }

    fetch('/api/products/by-slugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`lookup failed (${res.status})`);
        return res.json();
      })
      .then((data: { products: Product[] }) => {
        if (cancelled) return;
        const fresh = Object.fromEntries((data.products ?? []).map((product) => [product.slug, product]));
        setProducts(fresh);
        setLoadedKey(slugsKey);
        setFailedKey(null);
        writeCachedProducts(fresh);
      })
      .catch(() => {
        if (cancelled) return;
        if (hasSavedCopy) return; // keep showing the saved copy
        setProducts({});
        setLoadedKey(slugsKey);
        setFailedKey(slugsKey);
      });

    return () => {
      cancelled = true;
    };
  }, [slugsKey, attempt]);

  const items = lines
    .map((line): ResolvedCartItem | null => {
      const product = products[line.slug];
      if (!product) return null;
      return { ...line, name: product.name, price: product.price, imageUrl: product.imageUrl };
    })
    .filter((item): item is ResolvedCartItem => item !== null);

  const ready = hydrated && (slugsKey === '' || loadedKey === slugsKey);
  const error = ready && slugsKey !== '' && failedKey === slugsKey;

  return {
    items,
    ready,
    error,
    retry: () => {
      setFailedKey(null);
      setLoadedKey(null);
      setAttempt((count) => count + 1);
    },
  };
}
