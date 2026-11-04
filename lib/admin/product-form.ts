// Types shared by the admin product pages (server) and the product form (client).
// No 'server-only' on purpose: the form imports them.

export interface VariantRow {
  sku: string;
  color: string;
  colorFamily: string;
  hex: string;
  lensTint: string;
  isDefault: boolean;
  // Opening stock for a new SKU; for an existing one it is the current stock, read-only.
  stock: number;
  // False for a SKU already saved on the product: its code can't change and its stock
  // is adjusted from Inventory.
  isNew: boolean;
}

export interface BundleRow {
  name: string;
  quantity: number;
  componentSlug: string;
}

export interface ProductFormDefaults {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  productType: string;
  categorySlug: string;
  subcategorySlug: string;
  frameMaterial: string;
  lensOption: string;
  frameShape: string;
  lensSummary: string;
  nosePadType: string;
  lensWidthMm: string;
  bridgeWidthMm: string;
  templeLengthMm: string;
  weightG: string;
  compatibleWith: string;
  features: string;
  tags: string;
  listPrice: string;
  salePrice: string;
  isStudentEligible: boolean;
  hasEyewearKit: boolean;
  isFeatured: boolean;
  featuredRank: string;
  isNewArrival: boolean;
  warrantyYears: string;
  returnWindowDays: string;
  sortOrder: string;
  status: string;
  imageUrl: string | null;
  galleryUrls: string[];
  variants: VariantRow[];
  bundleItems: BundleRow[];
}

export interface ProductFormOptions {
  categories: { slug: string; name: string }[];
  subcategories: { slug: string; name: string; categorySlug: string }[];
  materials: string[];
  lenses: string[];
  shapes: string[];
  colorFamilies: { value: string; label: string }[];
}

export const MAX_GALLERY_IMAGES = 8;

export function emptyProductDefaults(options: ProductFormOptions, nextSortOrder: number): ProductFormDefaults {
  const categorySlug = options.categories[0]?.slug ?? '';
  return {
    slug: '',
    name: '',
    shortDescription: '',
    description: '',
    productType: 'FRAME',
    categorySlug,
    subcategorySlug: options.subcategories.find((sub) => sub.categorySlug === categorySlug)?.slug ?? '',
    frameMaterial: '',
    lensOption: '',
    frameShape: '',
    lensSummary: '',
    nosePadType: '',
    lensWidthMm: '',
    bridgeWidthMm: '',
    templeLengthMm: '',
    weightG: '',
    compatibleWith: '',
    features: '',
    tags: '',
    listPrice: '',
    salePrice: '',
    isStudentEligible: false,
    hasEyewearKit: false,
    isFeatured: false,
    featuredRank: '',
    isNewArrival: false,
    warrantyYears: '1',
    returnWindowDays: '',
    sortOrder: String(nextSortOrder),
    status: 'ACTIVE',
    imageUrl: null,
    galleryUrls: [],
    variants: [{ sku: '', color: '', colorFamily: '', hex: '', lensTint: '', isDefault: true, stock: 0, isNew: true }],
    bundleItems: [],
  };
}
