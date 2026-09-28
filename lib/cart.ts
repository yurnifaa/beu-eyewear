'use client';

import { useSyncExternalStore } from 'react';

export interface CartLine {
  slug: string;
  color?: string;
  quantity: number;
}

const STORAGE_KEY = 'beu:cart';
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) notify();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

function lineKey(slug: string, color: string | undefined) {
  return `${slug}::${color ?? ''}`;
}

function readLines(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is CartLine =>
        line && typeof line.slug === 'string' && typeof line.quantity === 'number' && line.quantity > 0,
    );
  } catch {
    return [];
  }
}

function writeLines(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // localStorage unavailable (private mode, blocked storage, etc.) — fail silently.
  }
  notify();
}

// See lib/wishlist.ts for why this must be a stable reference — a fresh `[]`
// on every call makes useSyncExternalStore loop forever.
const EMPTY_SNAPSHOT: CartLine[] = [];

function getServerSnapshot(): CartLine[] {
  return EMPTY_SNAPSHOT;
}

let cachedSnapshot: CartLine[] = [];
let cachedRaw: string | null = null;

function getSnapshot(): CartLine[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = readLines();
  }
  return cachedSnapshot;
}

export function addToCart(slug: string, quantity: number, color?: string) {
  const lines = readLines();
  const key = lineKey(slug, color);
  const existing = lines.find((line) => lineKey(line.slug, line.color) === key);

  const next = existing
    ? lines.map((line) => (lineKey(line.slug, line.color) === key ? { ...line, quantity: line.quantity + quantity } : line))
    : [...lines, { slug, color, quantity }];

  writeLines(next);
}

export function updateCartQuantity(slug: string, color: string | undefined, quantity: number) {
  const key = lineKey(slug, color);

  if (quantity <= 0) {
    writeLines(readLines().filter((line) => lineKey(line.slug, line.color) !== key));
    return;
  }

  writeLines(readLines().map((line) => (lineKey(line.slug, line.color) === key ? { ...line, quantity } : line)));
}

export function removeFromCart(slug: string, color?: string) {
  const key = lineKey(slug, color);
  writeLines(readLines().filter((line) => lineKey(line.slug, line.color) !== key));
}

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount(): number {
  const lines = useCartLines();
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
