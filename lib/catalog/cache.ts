import 'server-only';

import { revalidateTag } from 'next/cache';

// The storefront's read-only catalog loaders (lib/catalog/queries.ts) are cached for a short time so
// the home and shop pages don't re-query the database on every visit. They carry this tag.
export const CATALOG_CACHE_TAG = 'catalog';
export const CATALOG_REVALIDATE_SECONDS = 60;

// Call after anything that changes what shoppers see (products, stock, categories, offers, reviews,
// settings, orders that move stock). Stale data is served once while fresh data loads, and the short
// lifetime above is the fallback when the admin and the storefront run as separate servers and this
// call can't reach the storefront's cache.
export function refreshCatalog() {
  revalidateTag(CATALOG_CACHE_TAG, 'max');
}
