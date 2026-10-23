import 'server-only';

import { cache } from 'react';
import { getSheetCatalog, type SheetCatalog } from './sheet-catalog';
import { getLiveStock } from './stock';
import type {
  BundleComponent,
  CatalogProduct,
  Category,
  FrameMaterialDetail,
  LensOptionDetail,
  Offer,
  ProductReview,
  ShippingMethodDetail,
  StockStatus,
  StoreSettings,
  Subcategory,
} from './types';
import { SHIPPING_METHODS, type ShippingMethodId } from '@/lib/checkout/shipping';

// Storefront catalog queries. Same function names the pages already used, now answered
// from the Google Sheet (lib/catalog/sheet-catalog.ts) with live stock laid over it
// (lib/catalog/stock.ts). Nothing here exposes where the data comes from.

function stockStatusFor(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  return quantity <= threshold ? 'LOW_STOCK' : 'IN_STOCK';
}

function withLiveStock(catalog: SheetCatalog, live: Map<string, number> | undefined): SheetCatalog {
  const threshold = catalog.settings.lowStockThreshold;
  const products = catalog.products.map((product) => {
    const variants = product.variants.map((variant) => ({ ...variant, available: live?.get(variant.sku) ?? variant.available }));
    const stockQuantity = variants.reduce((sum, variant) => sum + variant.available, 0);
    return { ...product, variants, stockQuantity, stockStatus: stockStatusFor(stockQuantity, threshold) };
  });
  return { ...catalog, products };
}

// One catalog per request: the sheet copy plus live stock.
const load = cache(async (): Promise<SheetCatalog> => {
  const [catalog, live] = await Promise.all([getSheetCatalog(), getLiveStock()]);
  return withLiveStock(catalog, live);
});

export async function getStoreSettings(): Promise<StoreSettings> {
  return (await load()).settings;
}

export async function getCategories(): Promise<Category[]> {
  return (await load()).categories;
}

export async function getCategoryBySlug(slug: string | undefined): Promise<Category | undefined> {
  if (!slug) return undefined;
  return (await load()).categories.find((category) => category.slug === slug);
}

export async function getSubcategories(categorySlug: string): Promise<Subcategory[]> {
  return (await load()).subcategories.filter((subcategory) => subcategory.categorySlug === categorySlug);
}

export async function getAllSubcategories(): Promise<Subcategory[]> {
  return (await load()).subcategories;
}

export async function getSubcategoryBySlug(slug: string | undefined): Promise<Subcategory | undefined> {
  if (!slug) return undefined;
  return (await load()).subcategories.find((subcategory) => subcategory.slug === slug);
}

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

export async function getProducts(filters: ProductFilters = {}): Promise<ProductResults> {
  const { products, settings } = await load();

  const matching = products.filter(
    (product) =>
      (!filters.category || product.categorySlug === filters.category) &&
      (!filters.sub || product.subcategorySlug === filters.sub) &&
      (!filters.lens || product.lensOption === filters.lens) &&
      (!filters.material || product.frameMaterial === filters.material) &&
      (!filters.shape || product.frameShape === filters.shape) &&
      (!filters.color || product.variants.some((variant) => variant.colorFamily === filters.color)),
  );

  // Without a sort, products keep the order they have in the sheet.
  if (filters.sort === 'price-asc') matching.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
  if (filters.sort === 'price-desc') matching.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));

  const pageSize = settings.pageSize;
  const total = matching.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page ?? 1), totalPages);

  return { items: matching.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages };
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | undefined> {
  return (await load()).products.find((product) => product.slug === slug);
}

export async function getProductsBySlugs(slugs: string[]): Promise<CatalogProduct[]> {
  const wanted = new Set(slugs);
  return (await load()).products.filter((product) => wanted.has(product.slug));
}

export async function getRelatedProducts(product: CatalogProduct, limit = 4): Promise<CatalogProduct[]> {
  const { products } = await load();
  const others = products.filter((candidate) => candidate.slug !== product.slug);
  const sameSubcategory = others.filter((candidate) => candidate.subcategorySlug === product.subcategorySlug);
  const sameCategory = others.filter(
    (candidate) => candidate.categorySlug === product.categorySlug && candidate.subcategorySlug !== product.subcategorySlug,
  );
  return [...sameSubcategory, ...sameCategory].slice(0, limit);
}

// Products flagged is_featured, in featured_rank order; topped up from the rest of the
// catalog (one per category first) if fewer than `limit` are flagged.
export async function getFeaturedProducts(limit = 4): Promise<CatalogProduct[]> {
  const { products } = await load();
  const featured = products
    .filter((product) => product.isFeatured)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
  if (featured.length >= limit) return featured.slice(0, limit);

  const picked = new Set(featured.map((product) => product.slug));
  const filler: CatalogProduct[] = [];
  const seenCategories = new Set(featured.map((product) => product.categorySlug));
  for (const product of products) {
    if (featured.length + filler.length >= limit) break;
    if (picked.has(product.slug) || seenCategories.has(product.categorySlug)) continue;
    seenCategories.add(product.categorySlug);
    filler.push(product);
  }
  for (const product of products) {
    if (featured.length + filler.length >= limit) break;
    if (!picked.has(product.slug) && !filler.includes(product)) filler.push(product);
  }
  return [...featured, ...filler].slice(0, limit);
}

export async function searchProducts(query: string): Promise<CatalogProduct[]> {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const { products, categories, subcategories } = await load();
  const categoryNames = new Map(categories.map((category) => [category.slug, category.name]));
  const subcategoryNames = new Map(subcategories.map((subcategory) => [subcategory.slug, subcategory.name]));

  return products.filter((product) => {
    const haystack = [
      product.name,
      product.description,
      product.frameMaterial,
      product.lensOption,
      product.frameShape,
      product.tags.join(' '),
      product.variants.map((variant) => variant.color).join(' '),
      categoryNames.get(product.categorySlug),
      subcategoryNames.get(product.subcategorySlug),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

export async function getProductReviews(slug: string, limit = 20): Promise<ProductReview[]> {
  return (await load()).reviews.filter((review) => review.productSlug === slug).slice(0, limit);
}

// Reviews flagged for the home page, in their home_display_order.
export async function getFeaturedReviews(limit = 3): Promise<ProductReview[]> {
  return (await load()).reviews
    .filter((review) => review.featuredOrder !== undefined)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
    .slice(0, limit);
}

export async function getBundleComponents(slug: string): Promise<BundleComponent[]> {
  return (await load()).bundleComponents[slug] ?? [];
}

export async function getOffers(): Promise<Offer[]> {
  return (await load()).offers;
}

export async function getFilterOptions(): Promise<SheetCatalog['filters']> {
  return (await load()).filters;
}

export async function getFrameMaterialDetail(material: string | undefined): Promise<FrameMaterialDetail | undefined> {
  return material ? (await load()).frameMaterials[material] : undefined;
}

export async function getLensOptionDetail(lens: string | undefined): Promise<LensOptionDetail | undefined> {
  return lens ? (await load()).lensOptions[lens] : undefined;
}

// Sheet shipping methods, falling back to the built-in two if the tab is empty. Only ids
// the order schema knows (STANDARD, EXPRESS) are offered.
export async function getShippingMethods(): Promise<ShippingMethodDetail[]> {
  const known = new Set(Object.keys(SHIPPING_METHODS));
  const fromSheet = (await load()).shipping.filter((method) => known.has(method.id));
  if (fromSheet.length > 0) return fromSheet;
  return (Object.entries(SHIPPING_METHODS) as [ShippingMethodId, (typeof SHIPPING_METHODS)[ShippingMethodId]][]).map(
    ([id, method]) => ({ id, label: method.label, fee: method.fee, minDays: method.minDays, maxDays: method.maxDays }),
  );
}

export interface StockSummary {
  lowStock: number;
  outOfStock: number;
}

// Product-level counts for the admin dashboard cards.
export async function getStockSummary(): Promise<StockSummary> {
  const { products } = await load();
  return {
    lowStock: products.filter((product) => product.stockStatus === 'LOW_STOCK').length,
    outOfStock: products.filter((product) => product.stockStatus === 'OUT_OF_STOCK').length,
  };
}

// slug + chosen color -> the sellable variant. Items sold in a single option
// ("Standard") take no color.
export function findVariant(product: CatalogProduct, color: string | undefined) {
  if (color) return product.variants.find((variant) => variant.color === color);
  return product.variants.length === 1 && product.variants[0].color === 'Standard' ? product.variants[0] : undefined;
}
