import { z } from 'zod';
import { MAX_STOCK } from '@/lib/admin/config';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// SKUs are typed by people on stock sheets and barcodes: letters, digits and . _ -
export const SKU_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export const PRODUCT_TYPES = ['FRAME', 'SMART_FRAME', 'ACCESSORY', 'BUNDLE'] as const;
export const PRODUCT_STATUSES = ['ACTIVE', 'DRAFT', 'ARCHIVED'] as const;

export const PRODUCT_TYPE_LABELS: Record<(typeof PRODUCT_TYPES)[number], string> = {
  FRAME: 'Frame',
  SMART_FRAME: 'Smart frame',
  ACCESSORY: 'Accessory',
  BUNDLE: 'Bundle',
};

export const PRODUCT_STATUS_LABELS: Record<(typeof PRODUCT_STATUSES)[number], string> = {
  ACTIVE: 'Active (on sale)',
  DRAFT: 'Draft (hidden)',
  ARCHIVED: 'Archived (hidden)',
};

const wholeNumber = (label: string, { min = 0, max }: { min?: number; max: number }) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, `${label} must be a whole number`)
    .transform(Number)
    .pipe(z.number().min(min, `${label} must be ${min.toLocaleString('en-US')} or more`).max(max, `${label} must be ${max.toLocaleString('en-US')} or less`));

// A blank field means "not set" and is stored as null.
const optionalNumber = (label: string, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d+$/.test(value), `${label} must be a whole number`)
    .refine((value) => value === '' || Number(value) <= max, `${label} must be ${max.toLocaleString('en-US')} or less`)
    .transform((value) => (value === '' ? null : Number(value)));

const optionalText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .transform((value) => value || null);

// One entry per line or comma, blanks and repeats dropped.
function listOf(label: string, { max, itemMax, separator }: { max: number; itemMax: number; separator: RegExp }) {
  return z
    .string()
    .transform((value) => [...new Set(value.split(separator).map((part) => part.trim()).filter(Boolean))])
    .pipe(z.array(z.string().max(itemMax, `Each ${label} must be ${itemMax} characters or fewer`)).max(max, `Add at most ${max} ${label}s`));
}

export const variantSchema = z.object({
  sku: z.string().trim().min(1, 'Enter a SKU for every color').max(40, 'A SKU must be 40 characters or fewer').regex(SKU_PATTERN, 'SKUs use letters, numbers and . _ - only'),
  // "Standard" for items sold in a single option (care kits, sets).
  color: z.string().trim().min(1, 'Enter a color name for every row').max(40, 'A color name must be 40 characters or fewer'),
  colorFamily: z.string().trim().max(30).transform((value) => value || null),
  hex: z
    .string()
    .trim()
    .refine((value) => value === '' || /^#[0-9a-fA-F]{6}$/.test(value), 'Swatch colors look like #C0C6CF')
    .transform((value) => (value ? value.toUpperCase() : null)),
  lensTint: z.string().trim().max(40).transform((value) => value || null),
  isDefault: z.boolean(),
  // Opening stock. Only used when the SKU is new; existing SKUs change through Inventory.
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock can’t be negative').max(MAX_STOCK, `Stock must be ${MAX_STOCK.toLocaleString('en-US')} or less`),
});
export type VariantInput = z.infer<typeof variantSchema>;

export const bundleItemSchema = z.object({
  name: z.string().trim().min(1, 'Every bundle item needs a name').max(120, 'A bundle item name must be 120 characters or fewer'),
  quantity: z.number().int().min(1, 'Bundle quantities start at 1').max(99),
  componentSlug: z
    .string()
    .trim()
    .refine((value) => value === '' || SLUG_PATTERN.test(value), 'Component product slugs use lowercase letters, numbers and hyphens')
    .transform((value) => value || null),
});
export type BundleItemInput = z.infer<typeof bundleItemSchema>;

export const productFieldsSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter a product name').max(120, 'Name must be 120 characters or fewer'),
    shortDescription: z.string().trim().max(300, 'Short description must be 300 characters or fewer'),
    description: z.string().trim().max(4000, 'Description must be 4,000 characters or fewer'),
    productType: z.enum(PRODUCT_TYPES),
    categorySlug: z.string().trim().min(1, 'Choose a category'),
    subcategorySlug: z.string().trim().min(1, 'Choose a subcategory'),
    frameMaterial: optionalText('Frame material', 40),
    lensOption: optionalText('Lens option', 40),
    frameShape: optionalText('Frame shape', 40),
    lensSummary: optionalText('Lens summary', 200),
    nosePadType: optionalText('Nose pad type', 60),
    lensWidthMm: optionalNumber('Lens width', 200),
    bridgeWidthMm: optionalNumber('Bridge width', 100),
    templeLengthMm: optionalNumber('Temple length', 300),
    weightG: optionalNumber('Weight', 5000),
    compatibleWith: listOf('compatible product', { max: 20, itemMax: 80, separator: /[\n,|]/ }),
    features: listOf('feature', { max: 12, itemMax: 200, separator: /\n/ }),
    tags: listOf('tag', { max: 20, itemMax: 40, separator: /[\n,]/ }),
    listPrice: wholeNumber('Price', { min: 1, max: 10_000_000 }),
    salePrice: optionalNumber('Sale price', 10_000_000),
    isStudentEligible: z.boolean(),
    hasEyewearKit: z.boolean(),
    isFeatured: z.boolean(),
    featuredRank: optionalNumber('Featured rank', 99),
    isNewArrival: z.boolean(),
    warrantyYears: wholeNumber('Warranty', { max: 20 }),
    returnWindowDays: optionalNumber('Return window', 365),
    sortOrder: wholeNumber('Display order', { max: 100_000 }),
    status: z.enum(PRODUCT_STATUSES),
  })
  .refine((data) => data.salePrice === null || data.salePrice < data.listPrice, {
    message: 'The sale price must be lower than the price',
    path: ['salePrice'],
  });

export const createProductSchema = productFieldsSchema.safeExtend({
  slug: z
    .string()
    .trim()
    .min(1, 'Enter a slug')
    .max(80, 'Slug must be 80 characters or fewer')
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens, e.g. aria-aviator'),
});
