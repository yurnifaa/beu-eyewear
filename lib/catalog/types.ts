// Categories are admin-editable DB rows now, not a fixed compile-time set —
// this alias just documents intent at call sites.
export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  // Only set for sheet-backed categories.
  imageUrl?: string;
  displayOrder?: number;
}

export interface Subcategory {
  slug: string;
  categorySlug: CategorySlug;
  name: string;
  description?: string;
  displayOrder?: number;
}

export type FrameMaterial = 'Plastic' | 'Metal' | 'Acetate' | 'Mixed' | 'Titanium';

export type LensOption = 'Photochromic' | 'Polarized' | 'Anti-Radiation' | 'Anti-Fog' | 'UV Protection';

export type FrameShape = 'Round' | 'Square' | 'Cat-Eye' | 'Aviator' | 'Rectangle';

export interface Product {
  slug: string;
  name: string;
  description: string;
  price: number;
  categorySlug: CategorySlug;
  subcategorySlug: string;
  frameMaterial?: FrameMaterial;
  lensOption?: LensOption;
  frameShape?: FrameShape;
  colors: string[];
  warrantyYears: number;
  imageUrl?: string;
  stockQuantity: number;
}

export const LOW_STOCK_THRESHOLD = 5;

// ---------------------------------------------------------------------------
// Storefront catalog, read from the Google Sheet (lib/catalog/queries.ts).
// `Product` above is the legacy Prisma-backed shape (see LEGACY-CATALOG-ADMIN
// in docs/google-sheets-catalog.md); CatalogProduct extends it, so existing
// cards and cart code keep working: `price` is what the shopper pays today.
// ---------------------------------------------------------------------------

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type ProductType = 'FRAME' | 'SMART_FRAME' | 'ACCESSORY' | 'BUNDLE';

export interface ProductVariant {
  sku: string;
  // "Standard" for items sold in a single option (care kits, sets).
  color: string;
  colorFamily?: string;
  // Swatch color, for example "#DCE9F7".
  hex?: string;
  lensTint?: string;
  imageUrl?: string;
  available: number;
  isDefault: boolean;
}

export interface ProductDimensions {
  lensWidthMm?: number;
  bridgeWidthMm?: number;
  templeLengthMm?: number;
  weightG?: number;
}

export interface CatalogProduct extends Product {
  id: string;
  productType: ProductType;
  shortDescription: string;
  // Price before any automatic discount; `price` is the amount charged.
  listPrice: number;
  compareAtPrice?: number;
  isOnSale: boolean;
  isStudentEligible: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  featuredRank?: number;
  rating?: number;
  reviewCount: number;
  variants: ProductVariant[];
  stockStatus: StockStatus;
  lensSummary?: string;
  nosePadType?: string;
  dimensions?: ProductDimensions;
  features: string[];
  tags: string[];
  galleryUrls: string[];
  compatibleWith: string[];
  returnWindowDays: number;
  hasEyewearKit: boolean;
}

export interface ProductReview {
  id: string;
  productSlug?: string;
  rating: number;
  title: string;
  body: string;
  authorName: string;
  authorInitials: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt?: string;
  // Position in the home page testimonial row; unset for ordinary reviews.
  featuredOrder?: number;
}

export interface BundleComponent {
  name: string;
  quantity: number;
  slug?: string;
}

export interface FrameMaterialDetail {
  dimensions: string;
  weight: string;
  composition: string;
  performance: string;
  nosePad: string;
  isHypoallergenic: boolean;
}

export interface LensOptionDetail {
  description: string;
  metric?: string;
  upgradeMinPrice?: number;
  upgradeMaxPrice?: number;
}

export interface ShippingMethodDetail {
  id: string;
  label: string;
  fee: number;
  minDays: number;
  maxDays: number;
}

export interface Offer {
  id: string;
  name: string;
  description: string;
  badge: string;
  kind: 'PERCENT' | 'FIXED_AMOUNT';
  value: number;
  eligibility: 'NONE' | 'STUDENT_ID' | 'FIRST_ORDER';
  requiresCode: boolean;
  endsAt?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  hex?: string;
}

export interface StoreSettings {
  storeName: string;
  lowStockThreshold: number;
  pageSize: number;
  returnWindowDays: number;
  benefits: string[];
  supportEmail?: string;
  supportPhones: string[];
  website?: string;
  socialHandle?: string;
}

export interface FrameMaterialSpec {
  dimensions: string;
  weight: string;
  composition: string;
  performance: string;
  nosePad: 'Fixed' | 'Adjustable Silicone';
}

export interface LensOptionInfo {
  description: string;
}
