import 'server-only';

// A small per-process cache with a time limit. Next's fetch cache is switched off
// by the catalog pages' `dynamic = 'force-dynamic'`, so without this every page
// view would call Google. It also joins concurrent callers onto one request and
// serves the last good copy if Google briefly fails.

interface Entry<T> {
  at: number;
  value?: T;
  pending?: Promise<T>;
}

const store = new Map<string, Entry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const entry = store.get(key) as Entry<T> | undefined;
  const now = Date.now();

  if (entry?.value !== undefined && now - entry.at < ttlMs) return entry.value;
  if (entry?.pending) return entry.pending;

  const pending = load().then(
    (value) => {
      store.set(key, { at: Date.now(), value });
      return value;
    },
    (error: unknown) => {
      // Serve the previous copy rather than breaking the storefront.
      if (entry?.value !== undefined) {
        store.set(key, { at: Date.now() - ttlMs + 5_000, value: entry.value });
        return entry.value;
      }
      store.delete(key);
      throw error;
    },
  );
  store.set(key, { at: entry?.at ?? 0, value: entry?.value, pending });
  return pending;
}

export function invalidate(prefix: string) {
  for (const key of [...store.keys()]) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
