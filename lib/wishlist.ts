'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'beu:wishlist';
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

function readSlugs(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((slug) => typeof slug === 'string') : [];
  } catch {
    return [];
  }
}

function writeSlugs(slugs: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // localStorage unavailable (private mode, blocked storage, etc.) — fail silently.
  }
  notify();
}

// SSR has no window/localStorage to read, so the server always renders an
// empty wishlist. useSyncExternalStore reconciles this against the real
// client snapshot right after hydration without a mismatch warning. The
// returned array must be a stable reference — a fresh `[]` on every call
// makes useSyncExternalStore think the snapshot changes every render and
// loop forever.
const EMPTY_SNAPSHOT: string[] = [];

function getServerSnapshot(): string[] {
  return EMPTY_SNAPSHOT;
}

let cachedSnapshot: string[] = [];
let cachedRaw: string | null = null;

function getSnapshot(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = readSlugs();
  }
  return cachedSnapshot;
}

export function isWishlisted(slug: string): boolean {
  return readSlugs().includes(slug);
}

export function toggleWishlist(slug: string) {
  const current = readSlugs();
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
  writeSlugs(next);
}

export function removeFromWishlist(slug: string) {
  writeSlugs(readSlugs().filter((item) => item !== slug));
}

export function useWishlistSlugs(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useWishlist(slug: string) {
  const slugs = useWishlistSlugs();
  const toggle = useCallback(() => toggleWishlist(slug), [slug]);
  return { isWishlisted: slugs.includes(slug), toggle };
}

export function useWishlistCount(): number {
  return useWishlistSlugs().length;
}
