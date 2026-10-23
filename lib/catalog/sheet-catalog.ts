import 'server-only';

import { cached } from '@/lib/sheets/cache';
import { catalogCacheMs, isTabConfigured, type SheetTab } from '@/lib/sheets/config';
import { toBoolean, toList, toNumber, toText, type CsvRecord } from '@/lib/sheets/csv';
import { readTab } from '@/lib/sheets/source';
import { FRAME_MATERIALS, FRAME_SHAPES, LENS_OPTIONS } from './enums';
import { FRAME_MATERIAL_SPECS, LENS_OPTION_INFO } from './specs';
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
  ProductType,
  ProductVariant,
  ShippingMethodDetail,
  StoreSettings,
  Subcategory,
} from './types';

// The whole sheet-backed catalog, built from the published CSV tabs. Stock fields here
// come from the CSV copy of the `inventory` tab; queries.ts overlays live stock on top.
export interface SheetCatalog {
  settings: StoreSettings;
  categories: Category[];
  subcategories: Subcategory[];
  products: CatalogProduct[];
  reviews: ProductReview[];
  offers: Offer[];
  frameMaterials: Record<string, FrameMaterialDetail>;
  lensOptions: Record<string, LensOptionDetail>;
  shipping: ShippingMethodDetail[];
  bundleComponents: Record<string, BundleComponent[]>;
  filters: { material: FilterOption[]; lens: FilterOption[]; shape: FilterOption[]; color: FilterOption[] };
}

const DEFAULT_BENEFITS = ['Free Eyewear Kit Included', '7-Day Free Returns', 'Up To 5-Year Warranty'];

// Optional tabs may be unconfigured or briefly unreachable without taking the shop down.
async function readOptional(tab: SheetTab): Promise<CsvRecord[]> {
  if (!isTabConfigured(tab)) return [];
  try {
    return await readTab(tab);
  } catch (error) {
    console.warn(`[catalog] optional tab "${tab}" skipped:`, error instanceof Error ? error.message : 'unknown error');
    return [];
  }
}

// next/image only accepts local paths and the configured remote hosts, and the sheet is
// editable by people, so anything else is dropped rather than rendered.
function safeImage(value: string | undefined, uploaded: boolean): string | undefined {
  const url = toText(value);
  if (!url || !uploaded) return undefined;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && parsed.hostname.endsWith('.public.blob.vercel-storage.com')) return url;
  } catch {
    /* not a URL */
  }
  return undefined;
}

function isActive(row: CsvRecord, column = 'is_active') {
  // A missing column means "no opinion"; only an explicit FALSE hides a row.
  return row[column] === undefined || row[column] === '' || toBoolean(row[column]);
}

function orderBy<T extends { order: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.order - b.order);
}

function buildSettings(rows: CsvRecord[]): StoreSettings {
  const map = new Map(rows.map((row) => [row.setting_key, row.setting_value ?? '']));
  const text = (key: string) => toText(map.get(key));
  const benefits = [text('benefit_1'), text('benefit_2'), text('benefit_3')].filter((value): value is string => Boolean(value));
  return {
    storeName: text('store_name') ?? 'BeU Eyewear',
    lowStockThreshold: toNumber(map.get('low_stock_threshold')) ?? 5,
    pageSize: toNumber(map.get('catalog_page_size')) ?? 8,
    returnWindowDays: toNumber(map.get('return_window_days')) ?? 7,
    benefits: benefits.length > 0 ? benefits : DEFAULT_BENEFITS,
    supportEmail: text('support_email'),
    supportPhones: [text('support_phone_landline'), text('support_phone_mobile')].filter((value): value is string => Boolean(value)),
    website: text('website'),
    socialHandle: text('social_handle'),
  };
}

function buildFilterOptions(rows: CsvRecord[], group: string, fallback: readonly string[]): FilterOption[] {
  const fromSheet = orderBy(
    rows
      .filter((row) => row.lookup_group === group && toText(row.lookup_value) && isActive(row))
      .map((row) => ({
        value: row.lookup_value,
        label: toText(row.display_label) ?? row.lookup_value,
        hex: toText(row.swatch_hex),
        order: toNumber(row.display_order) ?? 0,
      })),
  ).map(({ value, label, hex }) => ({ value, label, hex }));
  return fromSheet.length > 0 ? fromSheet : fallback.map((value) => ({ value, label: value }));
}

async function buildCatalog(): Promise<SheetCatalog> {
  // Required tabs throw if they can't be read; the rest are optional.
  const [categoryRows, subcategoryRows, productRows, variantRows] = await Promise.all([
    readTab('categories'),
    readTab('subcategories'),
    readTab('products'),
    readTab('product_variants'),
  ]);
  const [settingRows, inventoryRows, reviewRows, discountRows, materialRows, lensRows, shippingRows, bundleRows, lookupRows] =
    await Promise.all([
      readOptional('store_settings'),
      readOptional('inventory'),
      readOptional('reviews'),
      readOptional('discounts'),
      readOptional('frame_materials'),
      readOptional('lens_options'),
      readOptional('shipping_methods'),
      readOptional('bundle_items'),
      readOptional('lookups'),
    ]);

  const settings = buildSettings(settingRows);

  const categories: Category[] = orderBy(
    categoryRows
      .filter((row) => toText(row.category_slug) && isActive(row))
      .map((row) => ({
        slug: row.category_slug,
        name: toText(row.name) ?? row.category_slug,
        description: toText(row.description) ?? '',
        imageUrl: safeImage(row.image_url, true),
        displayOrder: toNumber(row.display_order) ?? 99,
        order: toNumber(row.display_order) ?? 99,
      })),
  ).map(({ slug, name, description, imageUrl, displayOrder }) => ({ slug, name, description, imageUrl, displayOrder }));
  const categorySlugs = new Set(categories.map((category) => category.slug));

  const subcategories: Subcategory[] = orderBy(
    subcategoryRows
      .filter((row) => toText(row.subcategory_slug) && categorySlugs.has(row.category_slug) && isActive(row))
      .map((row) => ({
        slug: row.subcategory_slug,
        categorySlug: row.category_slug,
        name: toText(row.name) ?? row.subcategory_slug,
        description: toText(row.description),
        displayOrder: toNumber(row.display_order) ?? 99,
        order: toNumber(row.display_order) ?? 99,
      })),
  ).map(({ slug, categorySlug, name, description, displayOrder }) => ({ slug, categorySlug, name, description, displayOrder }));
  const subcategorySlugs = new Set(subcategories.map((subcategory) => subcategory.slug));

  // sku -> stock as the published CSV last showed it.
  const csvStock = new Map(inventoryRows.map((row) => [row.sku, toNumber(row.qty_available) ?? 0]));

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const row of variantRows) {
    if (!toText(row.sku) || !toText(row.product_id) || (row.status && row.status !== 'ACTIVE')) continue;
    const variant: ProductVariant = {
      sku: row.sku,
      color: toText(row.color_name) ?? 'Standard',
      colorFamily: toText(row.color_family),
      hex: /^#[0-9a-fA-F]{6}$/.test(row.color_hex ?? '') ? row.color_hex : undefined,
      lensTint: toText(row.lens_tint),
      // Variant photos follow the product's upload flag below.
      imageUrl: toText(row.image_url),
      available: Math.max(0, csvStock.get(row.sku) ?? 0),
      isDefault: toBoolean(row.is_default),
    };
    variantsByProduct.set(row.product_id, [...(variantsByProduct.get(row.product_id) ?? []), variant]);
  }

  let skipped = 0;
  const products: CatalogProduct[] = [];
  for (const row of productRows) {
    const slug = toText(row.slug);
    const name = toText(row.name);
    const listPrice = toNumber(row.base_price_php);
    if (
      !slug ||
      !name ||
      !listPrice ||
      listPrice <= 0 ||
      row.status !== 'ACTIVE' ||
      !categorySlugs.has(row.category_slug) ||
      !subcategorySlugs.has(row.subcategory_slug)
    ) {
      if (row.status === 'ACTIVE') skipped++;
      continue;
    }

    const uploaded = toBoolean(row.is_image_uploaded);
    const variants = (variantsByProduct.get(row.product_id) ?? []).map((variant) => ({
      ...variant,
      imageUrl: safeImage(variant.imageUrl, uploaded),
    }));
    if (variants.length === 0) {
      skipped++;
      continue;
    }

    const salePrice = toNumber(row.sale_price_php);
    const price = salePrice && salePrice > 0 && salePrice <= listPrice ? salePrice : listPrice;
    const dimensions = {
      lensWidthMm: toNumber(row.lens_width_mm),
      bridgeWidthMm: toNumber(row.bridge_width_mm),
      templeLengthMm: toNumber(row.temple_length_mm),
      weightG: toNumber(row.weight_g),
    };
    const rating = toNumber(row.rating_average);

    products.push({
      id: row.product_id,
      slug,
      name,
      description: toText(row.description) ?? '',
      shortDescription: toText(row.short_description) ?? '',
      productType: (toText(row.product_type) as ProductType | undefined) ?? 'FRAME',
      price,
      listPrice,
      compareAtPrice: price < listPrice ? listPrice : undefined,
      isOnSale: price < listPrice,
      isStudentEligible: toBoolean(row.is_student_eligible),
      isNewArrival: toBoolean(row.is_new_arrival),
      isFeatured: toBoolean(row.is_featured),
      featuredRank: toNumber(row.featured_rank),
      categorySlug: row.category_slug,
      subcategorySlug: row.subcategory_slug,
      frameMaterial: toText(row.frame_material) as FrameMaterial | undefined,
      lensOption: toText(row.lens_option) as LensOption | undefined,
      frameShape: toText(row.frame_shape) as FrameShape | undefined,
      lensSummary: toText(row.lens_summary),
      nosePadType: toText(row.nose_pad_type),
      dimensions: Object.values(dimensions).some((value) => value !== undefined) ? dimensions : undefined,
      colors: variants.filter((variant) => variant.color !== 'Standard').map((variant) => variant.color),
      variants,
      warrantyYears: toNumber(row.warranty_years) ?? 1,
      returnWindowDays: toNumber(row.return_window_days) ?? settings.returnWindowDays,
      hasEyewearKit: toBoolean(row.has_eyewear_kit),
      imageUrl: safeImage(row.primary_image_url, uploaded),
      galleryUrls: toList(row.gallery_image_urls)
        .map((url) => safeImage(url, uploaded))
        .filter((url): url is string => Boolean(url)),
      features: toList(row.feature_highlights),
      tags: toList(row.tags, ','),
      compatibleWith: toList(row.compatible_with),
      rating: rating && rating > 0 ? rating : undefined,
      reviewCount: toNumber(row.rating_count) ?? 0,
      stockQuantity: variants.reduce((sum, variant) => sum + variant.available, 0),
      stockStatus: 'IN_STOCK',
    });
  }
  if (skipped > 0) console.warn(`[catalog] ${skipped} active product row(s) skipped (missing price, category or variants).`);

  const slugById = new Map(products.map((product) => [product.id, product.slug]));

  const reviews: ProductReview[] = reviewRows
    .filter((row) => row.status === 'PUBLISHED' && slugById.has(row.product_id))
    .map((row) => ({
      id: row.review_id,
      productSlug: slugById.get(row.product_id),
      rating: Math.min(5, Math.max(1, toNumber(row.rating) ?? 5)),
      title: toText(row.title) ?? '',
      body: row.body ?? '',
      authorName: toText(row.reviewer_display_name) ?? 'Verified Buyer',
      authorInitials: toText(row.reviewer_initials) ?? 'VB',
      isVerifiedPurchase: toBoolean(row.is_verified_purchase),
      helpfulCount: toNumber(row.helpful_count) ?? 0,
      createdAt: toText(row.created_at),
      featuredOrder: toBoolean(row.is_featured_home) ? (toNumber(row.home_display_order) ?? 99) : undefined,
    }));

  const offers: Offer[] = discountRows
    .filter((row) => row.status === 'ACTIVE' && toBoolean(row.is_live))
    .map((row) => ({
      id: row.discount_id,
      name: toText(row.name) ?? 'Offer',
      description: toText(row.description) ?? '',
      badge: toText(row.badge_label) ?? 'Offer',
      kind: row.discount_type === 'FIXED_AMOUNT' ? ('FIXED_AMOUNT' as const) : ('PERCENT' as const),
      value: toNumber(row.discount_value) ?? 0,
      eligibility: (['STUDENT_ID', 'FIRST_ORDER'].includes(row.eligibility) ? row.eligibility : 'NONE') as Offer['eligibility'],
      requiresCode: toBoolean(row.requires_code),
      endsAt: toText(row.ends_at),
    }));

  // Sheet content first; the constants that shipped with the app fill any gap.
  const frameMaterials: Record<string, FrameMaterialDetail> = Object.fromEntries(
    Object.entries(FRAME_MATERIAL_SPECS).map(([key, spec]) => [
      key,
      {
        dimensions: spec.dimensions,
        weight: spec.weight,
        composition: spec.composition,
        performance: spec.performance,
        nosePad: spec.nosePad,
        isHypoallergenic: key === 'Titanium',
      },
    ]),
  );
  for (const row of materialRows) {
    if (!toText(row.frame_material) || !isActive(row)) continue;
    const fallback = frameMaterials[row.frame_material];
    frameMaterials[row.frame_material] = {
      dimensions: toText(row.dimensions_display) ?? fallback?.dimensions ?? '',
      weight: toText(row.weight_display) ?? fallback?.weight ?? '',
      composition: toText(row.composition) ?? fallback?.composition ?? '',
      performance: toText(row.performance_summary) ?? fallback?.performance ?? '',
      nosePad: toText(row.default_nose_pad_type) ?? fallback?.nosePad ?? '',
      isHypoallergenic: toBoolean(row.is_hypoallergenic),
    };
  }

  const lensOptions: Record<string, LensOptionDetail> = Object.fromEntries(
    Object.entries(LENS_OPTION_INFO).map(([key, info]) => [key, { description: info.description }]),
  );
  for (const row of lensRows) {
    if (!toText(row.lens_option) || !isActive(row)) continue;
    lensOptions[row.lens_option] = {
      description: toText(row.description) ?? lensOptions[row.lens_option]?.description ?? '',
      metric: toText(row.performance_metric),
      upgradeMinPrice: toNumber(row.upgrade_price_min_php),
      upgradeMaxPrice: toNumber(row.upgrade_price_max_php),
    };
  }

  const shipping: ShippingMethodDetail[] = shippingRows
    .filter((row) => toText(row.shipping_method_id) && isActive(row))
    .map((row) => ({
      id: row.shipping_method_id,
      label: toText(row.label) ?? row.shipping_method_id,
      fee: toNumber(row.fee_php) ?? 0,
      minDays: toNumber(row.min_delivery_days) ?? 1,
      maxDays: toNumber(row.max_delivery_days) ?? 1,
    }));

  const bundleComponents: Record<string, BundleComponent[]> = {};
  for (const row of bundleRows) {
    const bundleSlug = slugById.get(row.bundle_product_id);
    if (!bundleSlug) continue;
    (bundleComponents[bundleSlug] ??= []).push({
      name: toText(row.component_name) ?? 'Item',
      quantity: toNumber(row.qty) ?? 1,
      slug: slugById.get(row.component_product_id),
    });
  }

  return {
    settings,
    categories,
    subcategories,
    products,
    reviews,
    offers,
    frameMaterials,
    lensOptions,
    shipping,
    bundleComponents,
    filters: {
      material: buildFilterOptions(lookupRows, 'frame_material', FRAME_MATERIALS),
      lens: buildFilterOptions(lookupRows, 'lens_option', LENS_OPTIONS),
      shape: buildFilterOptions(lookupRows, 'frame_shape', FRAME_SHAPES),
      color: buildFilterOptions(lookupRows, 'color_family', []),
    },
  };
}

export function getSheetCatalog(): Promise<SheetCatalog> {
  return cached('catalog', catalogCacheMs(), buildCatalog);
}
