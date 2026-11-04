import 'server-only';

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ProductFormDefaults, ProductFormOptions } from './product-form';

export const ADMIN_PAGE_SIZE = 20;

export interface AdminProductFilters {
  q: string;
  category: string;
  status: string;
  type: string;
  page: number;
}

const STATUSES = ['ACTIVE', 'DRAFT', 'ARCHIVED'];
const TYPES = ['FRAME', 'SMART_FRAME', 'ACCESSORY', 'BUNDLE'];

export function parseProductFilters(params: Record<string, string | string[] | undefined>): AdminProductFilters {
  const text = (key: string) => (typeof params[key] === 'string' ? (params[key] as string).trim().slice(0, 120) : '');
  const page = Number(text('page'));
  return {
    q: text('q'),
    category: text('category'),
    status: STATUSES.includes(text('status')) ? text('status') : '',
    type: TYPES.includes(text('type')) ? text('type') : '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export async function getAdminProducts(filters: AdminProductFilters) {
  const where: Prisma.ProductWhereInput = {
    ...(filters.category && { categorySlug: filters.category }),
    ...(filters.status && { status: filters.status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED' }),
    ...(filters.type && { productType: filters.type as 'FRAME' | 'SMART_FRAME' | 'ACCESSORY' | 'BUNDLE' }),
    ...(filters.q && {
      OR: [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { slug: { contains: filters.q, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: filters.q, mode: 'insensitive' } } } },
      ],
    }),
  };

  const [filteredCount, totalCount] = await Promise.all([prisma.product.count({ where }), prisma.product.count()]);
  const totalPages = Math.max(1, Math.ceil(filteredCount / ADMIN_PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);

  const rows = await prisma.product.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
    select: {
      slug: true,
      name: true,
      imageUrl: true,
      listPrice: true,
      salePrice: true,
      status: true,
      productType: true,
      category: { select: { name: true } },
      subcategory: { select: { name: true } },
      variants: { select: { stockQuantity: true, isActive: true } },
    },
  });

  return {
    products: rows.map((row) => {
      const active = row.variants.filter((variant) => variant.isActive);
      return {
        slug: row.slug,
        name: row.name,
        imageUrl: row.imageUrl,
        listPrice: row.listPrice,
        salePrice: row.salePrice,
        status: row.status,
        productType: row.productType,
        categoryName: row.category.name,
        subcategoryName: row.subcategory.name,
        colors: active.length,
        stock: active.reduce((sum, variant) => sum + variant.stockQuantity, 0),
      };
    }),
    filteredCount,
    totalCount,
    page,
    totalPages,
  };
}

export async function getNextSortOrder(): Promise<number> {
  const last = await prisma.product.aggregate({ _max: { sortOrder: true } });
  return (last._max.sortOrder ?? 0) + 1;
}

// Everything the product form's selects are built from.
export async function getProductFormOptions(): Promise<ProductFormOptions> {
  const [categories, subcategories, filters] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ displayOrder: 'asc' }, { slug: 'asc' }], select: { slug: true, name: true } }),
    prisma.subcategory.findMany({ orderBy: [{ displayOrder: 'asc' }, { slug: 'asc' }], select: { slug: true, name: true, categorySlug: true } }),
    prisma.filterOption.findMany({ where: { isActive: true }, orderBy: [{ displayOrder: 'asc' }, { value: 'asc' }] }),
  ]);
  const values = (kind: string) => filters.filter((option) => option.kind === kind).map((option) => option.value);
  return {
    categories,
    subcategories,
    materials: values('FRAME_MATERIAL'),
    lenses: values('LENS_OPTION'),
    shapes: values('FRAME_SHAPE'),
    colorFamilies: filters.filter((option) => option.kind === 'COLOR_FAMILY').map((option) => ({ value: option.value, label: option.label })),
  };
}

export async function getProductForEdit(slug: string): Promise<ProductFormDefaults | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: [{ sortOrder: 'asc' }, { sku: 'asc' }] },
      bundleItems: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
    },
  });
  if (!row) return null;
  const text = (value: number | string | null) => (value === null ? '' : String(value));
  return {
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    productType: row.productType,
    categorySlug: row.categorySlug,
    subcategorySlug: row.subcategorySlug,
    frameMaterial: text(row.frameMaterial),
    lensOption: text(row.lensOption),
    frameShape: text(row.frameShape),
    lensSummary: text(row.lensSummary),
    nosePadType: text(row.nosePadType),
    lensWidthMm: text(row.lensWidthMm),
    bridgeWidthMm: text(row.bridgeWidthMm),
    templeLengthMm: text(row.templeLengthMm),
    weightG: text(row.weightG),
    compatibleWith: row.compatibleWith.join(', '),
    features: row.features.join('\n'),
    tags: row.tags.join(', '),
    listPrice: String(row.listPrice),
    salePrice: text(row.salePrice),
    isStudentEligible: row.isStudentEligible,
    hasEyewearKit: row.hasEyewearKit,
    isFeatured: row.isFeatured,
    featuredRank: text(row.featuredRank),
    isNewArrival: row.isNewArrival,
    warrantyYears: String(row.warrantyYears),
    returnWindowDays: text(row.returnWindowDays),
    sortOrder: String(row.sortOrder),
    status: row.status,
    imageUrl: row.imageUrl,
    galleryUrls: row.galleryUrls,
    variants: row.variants.map((variant) => ({
      sku: variant.sku,
      color: variant.color,
      colorFamily: variant.colorFamily ?? '',
      hex: variant.hex ?? '',
      lensTint: variant.lensTint ?? '',
      isDefault: variant.isDefault,
      stock: variant.stockQuantity,
      isNew: false,
    })),
    bundleItems: row.bundleItems.map((item) => ({ name: item.name, quantity: item.quantity, componentSlug: item.componentSlug ?? '' })),
  };
}
