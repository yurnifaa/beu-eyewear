import 'server-only';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { Prisma, Review } from '@prisma/client';
import { SHIPPING_METHODS, type ShippingMethodId } from '@/lib/checkout/shipping';
import { prisma } from '@/lib/prisma';
import { CATALOG_CACHE_TAG, CATALOG_REVALIDATE_SECONDS } from './cache';
import type { SearchSuggestionDTO } from './dto';
import { FRAME_MATERIALS, FRAME_SHAPES, LENS_OPTIONS } from './enums';
import { buildStoreSettings } from './settings';
import type {
  BundleComponent,
  CatalogProduct,
  Category,
  FilterOption,
  FrameMaterial,
  FrameMaterialDetail,
  FrameShape,
  LensOption,
  LensOptionDetail,
  Offer,
  ProductReview,
  ShippingMethodDetail,
  StockStatus,
  StoreSettings,
  Subcategory,
} from './types';

// Storefront catalog queries, answered from Postgres. The admin app edits the same tables.
//
// Two layers of reuse, both deliberate:
//  - React's per-request memoization (`cache`) so one page render never asks twice.
//  - A short server cache (`cachedRead`, below) for read-only loaders that many visitors share:
//    listings, categories, related products, reviews and so on. See lib/catalog/cache.ts.
//
// What is NOT cached across requests, on purpose: anything that decides what a shopper pays or
// whether they can buy it right now. That is a single product's own row and stock
// (getProductBySlug), the cart/checkout lookups (getProductsBySlugs) and the shipping rates that
// placeOrder charges (getShippingMethods).

// A product is on sale in the shop when it is ACTIVE, its category and subcategory are
// switched on, and it has at least one active color/SKU to buy.
const VISIBLE = {
  status: 'ACTIVE',
  category: { isActive: true },
  subcategory: { isActive: true },
  variants: { some: { isActive: true } },
} satisfies Prisma.ProductWhereInput;

const include = {
  variants: { where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { sku: 'asc' }] },
} satisfies Prisma.ProductInclude;

const SHOP_ORDER = [{ sortOrder: 'asc' }, { slug: 'asc' }] satisfies Prisma.ProductOrderByWithRelationInput[];

type ProductRow = Prisma.ProductGetPayload<{ include: typeof include }>;

function stockStatusFor(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  return quantity <= threshold ? 'LOW_STOCK' : 'IN_STOCK';
}

function undef<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// Short server cache for the read-only loaders the home, shop and product pages use. Results must be
// plain JSON (no Dates, and no `undefined` as the whole result: return null and convert back), so they
// survive the cache. Arguments become part of the cache key, so pass small values (a slug, not a whole
// product). lib/catalog/cache.ts says how it is refreshed. Loaders that must stay live (see the top of
// this file) are not wrapped.
function cachedRead<Args extends unknown[], Result>(name: string, read: (...args: Args) => Promise<Result>) {
  return unstable_cache(read, ['catalog', name], { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] });
}

export const getStoreSettings = cache(
  cachedRead('settings', async (): Promise<StoreSettings> => {
    return buildStoreSettings(await prisma.storeSetting.findMany());
  }),
);

// Average and count come from the published reviews, so they can never disagree with the
// reviews a shopper reads.
async function loadRatings(slugs: string[]) {
  const groups = await prisma.review.groupBy({
    by: ['productSlug'],
    where: { productSlug: { in: slugs }, status: 'PUBLISHED' },
    _avg: { rating: true },
    _count: { _all: true },
  });
  return new Map(
    groups.map((group) => [group.productSlug, { average: Math.round((group._avg.rating ?? 0) * 10) / 10, count: group._count._all }]),
  );
}

function toCatalogProduct(
  row: ProductRow,
  settings: StoreSettings,
  rating: { average: number; count: number } | undefined,
): CatalogProduct {
  const variants = row.variants.map((variant) => ({
    sku: variant.sku,
    color: variant.color,
    colorFamily: undef(variant.colorFamily),
    hex: undef(variant.hex),
    lensTint: undef(variant.lensTint),
    imageUrls: variant.imageUrls,
    available: Math.max(0, variant.stockQuantity),
    isDefault: variant.isDefault,
  }));
  // Cards and listings show one picture: the default color's first photo, else whichever color has one.
  const cover =
    variants.find((variant) => variant.isDefault && variant.imageUrls.length > 0)?.imageUrls[0] ??
    variants.find((variant) => variant.imageUrls.length > 0)?.imageUrls[0];
  const stockQuantity = variants.reduce((sum, variant) => sum + variant.available, 0);
  // A sale price only counts when it is a real reduction.
  const price = row.salePrice !== null && row.salePrice > 0 && row.salePrice < row.listPrice ? row.salePrice : row.listPrice;
  const dimensions = {
    lensWidthMm: undef(row.lensWidthMm),
    bridgeWidthMm: undef(row.bridgeWidthMm),
    templeLengthMm: undef(row.templeLengthMm),
    weightG: undef(row.weightG),
  };

  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    description: row.description,
    shortDescription: row.shortDescription,
    productType: row.productType,
    price,
    listPrice: row.listPrice,
    compareAtPrice: price < row.listPrice ? row.listPrice : undefined,
    isOnSale: price < row.listPrice,
    isNewArrival: row.isNewArrival,
    isFeatured: row.isFeatured,
    featuredRank: undef(row.featuredRank),
    categorySlug: row.categorySlug,
    subcategorySlug: row.subcategorySlug,
    frameMaterial: undef(row.frameMaterial) as FrameMaterial | undefined,
    lensOption: undef(row.lensOption) as LensOption | undefined,
    frameShape: undef(row.frameShape) as FrameShape | undefined,
    lensSummary: undef(row.lensSummary),
    nosePadType: undef(row.nosePadType),
    dimensions: Object.values(dimensions).some((value) => value !== undefined) ? dimensions : undefined,
    colors: variants.filter((variant) => variant.color !== 'Standard').map((variant) => variant.color),
    variants,
    warrantyYears: row.warrantyYears,
    returnWindowDays: row.returnWindowDays ?? settings.returnWindowDays,
    hasEyewearKit: row.hasEyewearKit,
    imageUrl: cover,
    features: row.features,
    tags: row.tags,
    compatibleWith: row.compatibleWith,
    rating: rating && rating.count > 0 ? rating.average : undefined,
    reviewCount: rating?.count ?? 0,
    stockQuantity,
    stockStatus: stockStatusFor(stockQuantity, settings.lowStockThreshold),
  };
}

async function present(rows: ProductRow[]): Promise<CatalogProduct[]> {
  if (rows.length === 0) return [];
  const [settings, ratings] = await Promise.all([getStoreSettings(), loadRatings(rows.map((row) => row.slug))]);
  return rows.map((row) => toCatalogProduct(row, settings, ratings.get(row.slug)));
}

// ---- Categories ------------------------------------------------------------------------

const CATEGORY_ORDER = [{ displayOrder: 'asc' }, { slug: 'asc' }] satisfies Prisma.CategoryOrderByWithRelationInput[];

const loadCategories = cache(
  cachedRead('categories', async (): Promise<Category[]> => {
    const rows = await prisma.category.findMany({ where: { isActive: true }, orderBy: CATEGORY_ORDER });
    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      description: row.description,
      imageUrl: undef(row.imageUrl),
      displayOrder: row.displayOrder,
    }));
  }),
);

export async function getCategories(): Promise<Category[]> {
  return loadCategories();
}

// One cover photo per category, for the home and listing hubs. It runs a query per category (in
// parallel), on every home and listing visit, so it is worth sharing between visitors.
const cachedCategoryPreviewImages = cachedRead('category-preview-images', async (): Promise<Record<string, string>> => {
  const categories = await prisma.category.findMany({ where: { isActive: true }, select: { slug: true } });
  const map: Record<string, string> = {};
  await Promise.all(
    categories.map(async (cat) => {
      const variant = await prisma.productVariant.findFirst({
        where: {
          isActive: true,
          imageUrls: { isEmpty: false },
          product: { ...VISIBLE, categorySlug: cat.slug },
        },
        orderBy: [{ product: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
        select: { imageUrls: true },
      });
      if (variant) map[cat.slug] = variant.imageUrls[0];
    }),
  );
  return map;
});

export async function getCategoryPreviewImages(): Promise<Record<string, string>> {
  return cachedCategoryPreviewImages();
}

export async function getCategoryBySlug(slug: string | undefined): Promise<Category | undefined> {
  if (!slug) return undefined;
  return (await loadCategories()).find((category) => category.slug === slug);
}

const loadSubcategories = cache(
  cachedRead('subcategories', async (): Promise<Subcategory[]> => {
    const rows = await prisma.subcategory.findMany({
      where: { isActive: true, category: { isActive: true } },
      orderBy: [{ displayOrder: 'asc' }, { slug: 'asc' }],
    });
    return rows.map((row) => ({
      slug: row.slug,
      categorySlug: row.categorySlug,
      name: row.name,
      description: undef(row.description),
      displayOrder: row.displayOrder,
    }));
  }),
);

export async function getSubcategories(categorySlug: string): Promise<Subcategory[]> {
  return (await loadSubcategories()).filter((subcategory) => subcategory.categorySlug === categorySlug);
}

export async function getAllSubcategories(): Promise<Subcategory[]> {
  return loadSubcategories();
}

export async function getSubcategoryBySlug(slug: string | undefined): Promise<Subcategory | undefined> {
  if (!slug) return undefined;
  return (await loadSubcategories()).find((subcategory) => subcategory.slug === slug);
}

// ---- Products --------------------------------------------------------------------------

export interface ProductFilters {
  category?: string;
  sub?: string;
  lens?: string;
  material?: string;
  shape?: string;
  color?: string;
  sort?: 'price-asc' | 'price-desc';
  page?: number;
}

export interface ProductResults {
  items: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

async function readProducts(filters: ProductFilters): Promise<ProductResults> {
  const where: Prisma.ProductWhereInput = {
    ...VISIBLE,
    ...(filters.category && { categorySlug: filters.category }),
    ...(filters.sub && { subcategorySlug: filters.sub }),
    ...(filters.lens && { lensOption: filters.lens }),
    ...(filters.material && { frameMaterial: filters.material }),
    ...(filters.shape && { frameShape: filters.shape }),
    ...(filters.color && { variants: { some: { isActive: true, colorFamily: filters.color } } }),
  };

  const [settings, total] = await Promise.all([getStoreSettings(), prisma.product.count({ where })]);
  const pageSize = settings.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page ?? 1), totalPages);

  // The price a shopper pays is computed (sale price or list price), so a price sort
  // happens after the matching rows are loaded; otherwise the database pages for us.
  if (filters.sort) {
    const items = await present(await prisma.product.findMany({ where, include, orderBy: SHOP_ORDER }));
    const direction = filters.sort === 'price-asc' ? 1 : -1;
    items.sort((a, b) => direction * (a.price - b.price) || a.name.localeCompare(b.name));
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages };
  }

  const rows = await prisma.product.findMany({ where, include, orderBy: SHOP_ORDER, skip: (page - 1) * pageSize, take: pageSize });
  return { items: await present(rows), total, page, pageSize, totalPages };
}

const cachedProducts = cachedRead('products', readProducts);

export async function getProducts(filters: ProductFilters = {}): Promise<ProductResults> {
  return cachedProducts(filters);
}

// Live on purpose (this is the stock and price a shopper is about to buy), so no cross-request cache.
// `cache` makes the product page's metadata and its body share one lookup, and the row, its ratings
// and the settings don't depend on each other, so they are fetched together.
export const getProductBySlug = cache(async (slug: string): Promise<CatalogProduct | undefined> => {
  const [row, ratings, settings] = await Promise.all([
    prisma.product.findFirst({ where: { ...VISIBLE, slug }, include }),
    loadRatings([slug]),
    getStoreSettings(),
  ]);
  return row ? toCatalogProduct(row, settings, ratings.get(slug)) : undefined;
});

export async function getProductsBySlugs(slugs: string[]): Promise<CatalogProduct[]> {
  if (slugs.length === 0) return [];
  return present(await prisma.product.findMany({ where: { ...VISIBLE, slug: { in: slugs } }, include, orderBy: SHOP_ORDER }));
}

// "You might also like": the same subcategory first, topped up from the same category. Shared between
// visitors (60s, refreshed with the catalog), keyed by the three slugs rather than the whole product.
const cachedRelatedProducts = cachedRead(
  'related-products',
  async (slug: string, subcategorySlug: string, categorySlug: string, limit: number): Promise<CatalogProduct[]> => {
    const sameSubcategory = await prisma.product.findMany({
      where: { ...VISIBLE, subcategorySlug, slug: { not: slug } },
      include,
      orderBy: SHOP_ORDER,
      take: limit,
    });
    const rows = [...sameSubcategory];
    if (rows.length < limit) {
      rows.push(
        ...(await prisma.product.findMany({
          where: {
            ...VISIBLE,
            categorySlug,
            slug: { notIn: [slug, ...rows.map((row) => row.slug)] },
          },
          include,
          orderBy: SHOP_ORDER,
          take: limit - rows.length,
        })),
      );
    }
    return present(rows);
  },
);

export async function getRelatedProducts(product: CatalogProduct, limit = 4): Promise<CatalogProduct[]> {
  return cachedRelatedProducts(product.slug, product.subcategorySlug, product.categorySlug, limit);
}

// Products flagged is_featured, in featured_rank order; topped up from the rest of the
// catalog (one per category first) if fewer than `limit` are flagged.
async function readFeaturedProducts(limit: number): Promise<CatalogProduct[]> {
  const featured = await prisma.product.findMany({
    where: { ...VISIBLE, isFeatured: true },
    include,
    orderBy: [{ featuredRank: { sort: 'asc', nulls: 'last' } }, ...SHOP_ORDER],
    take: limit,
  });
  if (featured.length >= limit) return present(featured);

  const others = await prisma.product.findMany({
    where: { ...VISIBLE, slug: { notIn: featured.map((row) => row.slug) } },
    orderBy: SHOP_ORDER,
    select: { slug: true, categorySlug: true },
  });
  const filler: string[] = [];
  const seenCategories = new Set(featured.map((row) => row.categorySlug));
  for (const other of others) {
    if (featured.length + filler.length >= limit) break;
    if (seenCategories.has(other.categorySlug)) continue;
    seenCategories.add(other.categorySlug);
    filler.push(other.slug);
  }
  for (const other of others) {
    if (featured.length + filler.length >= limit) break;
    if (!filler.includes(other.slug)) filler.push(other.slug);
  }

  const fillerRows = filler.length > 0 ? await prisma.product.findMany({ where: { slug: { in: filler } }, include }) : [];
  const bySlug = new Map(fillerRows.map((row) => [row.slug, row]));
  return present([...featured, ...filler.map((slug) => bySlug.get(slug)).filter((row): row is ProductRow => Boolean(row))].slice(0, limit));
}

const cachedFeaturedProducts = cachedRead('featured-products', readFeaturedProducts);

export async function getFeaturedProducts(limit = 4): Promise<CatalogProduct[]> {
  return cachedFeaturedProducts(limit);
}

// Lowest price among eyewear (frames and smart frames), for the "from" price on the home page.
// Accessories and bundles are left out so a lens cloth never sets the anchor. Undefined when the
// catalog has no priced eyewear, so the page can simply omit the price.
export async function getStartingPrice(): Promise<number | undefined> {
  const rows = await prisma.product.findMany({
    where: { ...VISIBLE, productType: { in: ['FRAME', 'SMART_FRAME'] } },
    select: { listPrice: true, salePrice: true },
  });
  const prices = rows
    .map((row) => (row.salePrice !== null && row.salePrice > 0 && row.salePrice < row.listPrice ? row.salePrice : row.listPrice))
    .filter((price) => price > 0);
  return prices.length > 0 ? Math.min(...prices) : undefined;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// The structured fields a search looks at. Descriptions are deliberately not searched: prose words
// ("jacket", "jewelry", "case") made short queries match unrelated products.
interface SearchText {
  name: string;
  category: string;
  subcategory: string;
  frameMaterial: string | null;
  lensOption: string | null;
  frameShape: string | null;
  tags: string[];
  colors: string[];
}

// The one definition of "does this product match the search words", shared by the results page
// (searchProducts) and the header suggestions (getSearchSuggestions) so they can never disagree.
// Every word must match the start of a word in some field; heavier fields rank higher. Ties keep
// the order the items came in (the sort is stable).
function rankSearchRows<T>(items: T[], query: string, textOf: (item: T) => SearchText): T[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const patterns = tokens.map((t) => new RegExp(`\\b${escapeRegex(t)}`, 'i'));
  const scored: { item: T; score: number }[] = [];

  for (const item of items) {
    const text = textOf(item);
    const fields: [string, number][] = [
      [text.name, 10],
      [text.category, 6],
      [text.subcategory, 6],
      [text.frameMaterial ?? '', 4],
      [text.lensOption ?? '', 4],
      [text.frameShape ?? '', 4],
      [text.tags.join(' '), 4],
      [text.colors.join(' '), 4],
    ];

    let allMatch = true;
    let score = 0;

    for (const pattern of patterns) {
      let tokenMatched = false;
      for (const [field, weight] of fields) {
        if (field && pattern.test(field)) {
          score += weight;
          tokenMatched = true;
        }
      }
      if (!tokenMatched) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.item);
}

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  if (query.trim() === '') return [];

  const rows = await prisma.product.findMany({
    where: VISIBLE,
    include: { ...include, category: { select: { name: true } }, subcategory: { select: { name: true } } },
    orderBy: SHOP_ORDER,
  });

  const ranked = rankSearchRows(rows, query, (row) => ({
    name: row.name,
    category: row.category.name,
    subcategory: row.subcategory.name,
    frameMaterial: row.frameMaterial,
    lensOption: row.lensOption,
    frameShape: row.frameShape,
    tags: row.tags,
    colors: row.variants.map((variant) => variant.color),
  }));
  return present(ranked);
}

// A lean copy of every visible product, just enough to match and to draw a suggestion row. Cached
// like the other shared reads, so typing in the search box costs one DB read a minute at most
// instead of one per keystroke. Plain JSON, so it survives the cache.
type SearchIndexEntry = SearchText & { slug: string; price: number; imageUrl: string | null; stockQuantity: number };

const getSearchIndex = cachedRead('search-index', async (): Promise<SearchIndexEntry[]> => {
  const rows = await prisma.product.findMany({
    where: VISIBLE,
    select: {
      slug: true,
      name: true,
      listPrice: true,
      salePrice: true,
      frameMaterial: true,
      lensOption: true,
      frameShape: true,
      tags: true,
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      variants: {
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { sku: 'asc' }],
        select: { color: true, isDefault: true, imageUrls: true, stockQuantity: true },
      },
    },
    orderBy: SHOP_ORDER,
  });

  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    // Same rules as toCatalogProduct: the default color's first photo, else any color's; a sale price
    // only counts when it is a real reduction.
    imageUrl:
      row.variants.find((variant) => variant.isDefault && variant.imageUrls.length > 0)?.imageUrls[0] ??
      row.variants.find((variant) => variant.imageUrls.length > 0)?.imageUrls[0] ??
      null,
    price: row.salePrice !== null && row.salePrice > 0 && row.salePrice < row.listPrice ? row.salePrice : row.listPrice,
    stockQuantity: row.variants.reduce((sum, variant) => sum + Math.max(0, variant.stockQuantity), 0),
    category: row.category.name,
    subcategory: row.subcategory.name,
    frameMaterial: row.frameMaterial,
    lensOption: row.lensOption,
    frameShape: row.frameShape,
    tags: row.tags,
    colors: row.variants.map((variant) => variant.color),
  }));
});

// The few best matches for the header search dropdown.
export async function getSearchSuggestions(query: string, limit = 6): Promise<SearchSuggestionDTO[]> {
  if (query.trim() === '') return [];
  const index = await getSearchIndex();
  return rankSearchRows(index, query, (entry) => entry)
    .slice(0, limit)
    .map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      price: entry.price,
      imageUrl: entry.imageUrl ?? undefined,
      outOfStock: entry.stockQuantity <= 0,
    }));
}

// ---- Reviews ---------------------------------------------------------------------------

function toReview(row: Review): ProductReview {
  return {
    id: row.id,
    productSlug: row.productSlug,
    rating: row.rating,
    title: row.title,
    body: row.body,
    authorName: row.authorName,
    authorInitials: row.authorInitials,
    isVerifiedPurchase: row.isVerifiedPurchase,
    helpfulCount: row.helpfulCount,
    createdAt: row.createdAt.toISOString(),
    featuredOrder: undef(row.featuredOrder),
  };
}

const cachedProductReviews = cachedRead('product-reviews', async (slug: string, limit: number): Promise<ProductReview[]> => {
  const rows = await prisma.review.findMany({
    where: { productSlug: slug, status: 'PUBLISHED' },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: limit,
  });
  return rows.map(toReview);
});

export async function getProductReviews(slug: string, limit = 20): Promise<ProductReview[]> {
  return cachedProductReviews(slug, limit);
}

// Reviews flagged for the home page, in their home display order.
const cachedFeaturedReviews = cachedRead('featured-reviews', async (limit: number): Promise<ProductReview[]> => {
  const rows = await prisma.review.findMany({
    where: { status: 'PUBLISHED', featuredOrder: { not: null }, product: { is: VISIBLE } },
    orderBy: [{ featuredOrder: 'asc' }, { id: 'asc' }],
    take: limit,
  });
  return rows.map(toReview);
});

export async function getFeaturedReviews(limit = 3): Promise<ProductReview[]> {
  return cachedFeaturedReviews(limit);
}

// ---- Bundles, offers, filters and product page content -----------------------------------

const cachedBundleComponents = cachedRead('bundle-components', async (slug: string): Promise<BundleComponent[]> => {
  const items = await prisma.bundleItem.findMany({ where: { bundleSlug: slug }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  const linked = items.map((item) => item.componentSlug).filter((value): value is string => Boolean(value));
  // Only link to components that are actually on sale.
  const live = new Set(
    linked.length > 0 ? (await prisma.product.findMany({ where: { ...VISIBLE, slug: { in: linked } }, select: { slug: true } })).map((row) => row.slug) : [],
  );
  return items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    slug: item.componentSlug && live.has(item.componentSlug) ? item.componentSlug : undefined,
  }));
});

export async function getBundleComponents(slug: string): Promise<BundleComponent[]> {
  return cachedBundleComponents(slug);
}

const getOffersCached = cachedRead('offers', async (): Promise<Offer[]> => {
  const rows = await prisma.offer.findMany({
    where: { isActive: true, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    badge: row.badge,
    kind: row.kind,
    value: row.value,
    eligibility: row.eligibility,
    requiresCode: row.requiresCode,
    endsAt: row.endsAt?.toISOString(),
    termsAndConditions: row.termsAndConditions,
  }));
});

export async function getOffers(): Promise<Offer[]> {
  return getOffersCached();
}

export interface CatalogFilters {
  material: FilterOption[];
  lens: FilterOption[];
  shape: FilterOption[];
  color: FilterOption[];
}

const getFilterOptionsCached = cachedRead('filter-options', async (): Promise<CatalogFilters> => {
  const rows = await prisma.filterOption.findMany({ where: { isActive: true }, orderBy: [{ displayOrder: 'asc' }, { value: 'asc' }] });
  const pick = (kind: (typeof rows)[number]['kind'], fallback: readonly string[]): FilterOption[] => {
    const chosen = rows.filter((row) => row.kind === kind).map((row) => ({ value: row.value, label: row.label, hex: undef(row.hex) }));
    return chosen.length > 0 ? chosen : fallback.map((value) => ({ value, label: value }));
  };
  return {
    material: pick('FRAME_MATERIAL', FRAME_MATERIALS),
    lens: pick('LENS_OPTION', LENS_OPTIONS),
    shape: pick('FRAME_SHAPE', FRAME_SHAPES),
    color: pick('COLOR_FAMILY', []),
  };
});

export async function getFilterOptions(): Promise<CatalogFilters> {
  return getFilterOptionsCached();
}

// (Cached: null, not undefined, stands for "no such row", then it is turned back into undefined.)
const cachedFrameMaterialDetail = cachedRead('frame-material-detail', async (material: string): Promise<FrameMaterialDetail | null> => {
  const row = await prisma.frameMaterialInfo.findFirst({ where: { material, isActive: true } });
  return row
    ? {
        dimensions: row.dimensions,
        weight: row.weight,
        composition: row.composition,
        performance: row.performance,
        nosePad: row.nosePad,
        isHypoallergenic: row.isHypoallergenic,
      }
    : null;
});

export async function getFrameMaterialDetail(material: string | undefined): Promise<FrameMaterialDetail | undefined> {
  if (!material) return undefined;
  return (await cachedFrameMaterialDetail(material)) ?? undefined;
}

const cachedLensOptionDetail = cachedRead('lens-option-detail', async (lens: string): Promise<LensOptionDetail | null> => {
  const row = await prisma.lensOptionInfo.findFirst({ where: { lensOption: lens, isActive: true } });
  return row
    ? {
        description: row.description,
        metric: undef(row.metric),
        upgradeMinPrice: undef(row.upgradeMinPrice),
        upgradeMaxPrice: undef(row.upgradeMaxPrice),
      }
    : null;
});

export async function getLensOptionDetail(lens: string | undefined): Promise<LensOptionDetail | undefined> {
  if (!lens) return undefined;
  return (await cachedLensOptionDetail(lens)) ?? undefined;
}

// Active rates from the database, falling back to the built-in two if none are set up.
// Live: checkout and placeOrder charge from this, so they must never see a stale fee.
export async function getShippingMethods(): Promise<ShippingMethodDetail[]> {
  const rows = await prisma.shippingRate.findMany({ where: { isActive: true }, orderBy: { fee: 'asc' } });
  if (rows.length > 0) {
    return rows.map((row) => ({ id: row.method, label: row.label, fee: row.fee, minDays: row.minDays, maxDays: row.maxDays }));
  }
  return (Object.entries(SHIPPING_METHODS) as [ShippingMethodId, (typeof SHIPPING_METHODS)[ShippingMethodId]][]).map(
    ([id, method]) => ({ id, label: method.label, fee: method.fee, minDays: method.minDays, maxDays: method.maxDays }),
  );
}

// The same rates for pages that only describe them (FAQ, contact, shipping policy). Shared between
// visitors for up to a minute; never use it to charge anyone.
const cachedShippingMethods = cachedRead('shipping-methods', getShippingMethods);

export async function getShippingMethodsForDisplay(): Promise<ShippingMethodDetail[]> {
  return cachedShippingMethods();
}

export interface StockSummary {
  lowStock: number;
  outOfStock: number;
}

// Product-level counts for the admin dashboard cards.
export async function getStockSummary(): Promise<StockSummary> {
  const [settings, totals] = await Promise.all([
    getStoreSettings(),
    prisma.productVariant.groupBy({
      by: ['productSlug'],
      where: { isActive: true, product: { is: VISIBLE } },
      _sum: { stockQuantity: true },
    }),
  ]);
  let lowStock = 0;
  let outOfStock = 0;
  for (const { _sum } of totals) {
    const status = stockStatusFor(_sum.stockQuantity ?? 0, settings.lowStockThreshold);
    if (status === 'LOW_STOCK') lowStock++;
    if (status === 'OUT_OF_STOCK') outOfStock++;
  }
  return { lowStock, outOfStock };
}

// slug + chosen color -> the sellable variant. Items sold in a single option
// ("Standard") take no color.
export function findVariant(product: CatalogProduct, color: string | undefined) {
  if (color) return product.variants.find((variant) => variant.color === color);
  return product.variants.length === 1 && product.variants[0].color === 'Standard' ? product.variants[0] : undefined;
}
