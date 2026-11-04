// Shape of prisma/seed-data/catalog.json: the catalog as it was imported from the old
// Google Sheet, normalized for Postgres. prisma/seed.ts loads it into the database.
// Type-only: nothing here runs.

export interface SnapshotVariant {
  sku: string;
  color: string;
  colorFamily: string | null;
  hex: string | null;
  lensTint: string | null;
  isDefault: boolean;
  sortOrder: number;
  // Opening stock, recorded as an ADJUSTMENT movement the first time the SKU is seeded.
  stock: number;
}

export interface SnapshotProduct {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  productType: 'FRAME' | 'SMART_FRAME' | 'ACCESSORY' | 'BUNDLE';
  categorySlug: string;
  subcategorySlug: string;
  frameMaterial: string | null;
  lensOption: string | null;
  frameShape: string | null;
  lensSummary: string | null;
  nosePadType: string | null;
  lensWidthMm: number | null;
  bridgeWidthMm: number | null;
  templeLengthMm: number | null;
  weightG: number | null;
  compatibleWith: string[];
  features: string[];
  tags: string[];
  listPrice: number;
  salePrice: number | null;
  isStudentEligible: boolean;
  hasEyewearKit: boolean;
  isFeatured: boolean;
  featuredRank: number | null;
  isNewArrival: boolean;
  warrantyYears: number;
  returnWindowDays: number | null;
  imageUrl: string | null;
  galleryUrls: string[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  // 1-based position in the Sheet; 0 would mean "not set".
  sortOrder: number;
  createdAt: string;
  variants: SnapshotVariant[];
}

export interface CatalogSnapshot {
  generatedAt: string;
  // Tabs that were skipped because the link in .env did not return the expected columns;
  // their rows come from the built-in defaults instead.
  defaultedTabs: string[];
  settings: Record<string, string>;
  categories: {
    slug: string;
    name: string;
    description: string;
    imageUrl: string | null;
    displayOrder: number;
    isActive: boolean;
  }[];
  subcategories: {
    slug: string;
    categorySlug: string;
    name: string;
    description: string | null;
    displayOrder: number;
    isActive: boolean;
  }[];
  products: SnapshotProduct[];
  reviews: {
    id: string;
    productSlug: string;
    rating: number;
    title: string;
    body: string;
    authorName: string;
    authorInitials: string;
    isVerifiedPurchase: boolean;
    helpfulCount: number;
    status: 'PUBLISHED' | 'PENDING' | 'HIDDEN';
    featuredOrder: number | null;
    createdAt: string;
  }[];
  offers: {
    name: string;
    description: string;
    badge: string;
    kind: 'PERCENT' | 'FIXED_AMOUNT';
    value: number;
    eligibility: 'NONE' | 'STUDENT_ID' | 'FIRST_ORDER';
    requiresCode: boolean;
    endsAt: string | null;
  }[];
  shippingRates: {
    method: 'STANDARD' | 'EXPRESS';
    label: string;
    fee: number;
    minDays: number;
    maxDays: number;
    isActive: boolean;
  }[];
  frameMaterials: {
    material: string;
    dimensions: string;
    weight: string;
    composition: string;
    performance: string;
    nosePad: string;
    isHypoallergenic: boolean;
  }[];
  lensOptions: {
    lensOption: string;
    description: string;
    metric: string | null;
    upgradeMinPrice: number | null;
    upgradeMaxPrice: number | null;
  }[];
  filterOptions: {
    kind: 'FRAME_MATERIAL' | 'LENS_OPTION' | 'FRAME_SHAPE' | 'COLOR_FAMILY';
    value: string;
    label: string;
    hex: string | null;
    displayOrder: number;
  }[];
  bundleItems: {
    bundleSlug: string;
    name: string;
    quantity: number;
    componentSlug: string | null;
    sortOrder: number;
  }[];
}
