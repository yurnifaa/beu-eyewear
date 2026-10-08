import type { Prisma, Product as PrismaProduct } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Category, FrameMaterial, FrameShape, LensOption, Product, Subcategory } from './types';

const PAGE_SIZE = 8;

function mapProduct(row: PrismaProduct): Product {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    categorySlug: row.categorySlug,
    subcategorySlug: row.subcategorySlug,
    frameMaterial: (row.frameMaterial ?? undefined) as FrameMaterial | undefined,
    lensOption: (row.lensOption ?? undefined) as LensOption | undefined,
    frameShape: (row.frameShape ?? undefined) as FrameShape | undefined,
    colors: row.colors,
    warrantyYears: row.warrantyYears,
    imageUrl: row.imageUrl ?? undefined,
    stockQuantity: row.stockQuantity,
  };
}

export async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: { slug: 'asc' } });
}

export async function getCategoryBySlug(slug: string | undefined): Promise<Category | undefined> {
  if (!slug) return undefined;
  const category = await prisma.category.findUnique({ where: { slug } });
  return category ?? undefined;
}

export async function getSubcategories(categorySlug: string): Promise<Subcategory[]> {
  return prisma.subcategory.findMany({ where: { categorySlug }, orderBy: { slug: 'asc' } });
}

export async function getAllSubcategories(): Promise<Subcategory[]> {
  return prisma.subcategory.findMany({ orderBy: [{ categorySlug: 'asc' }, { slug: 'asc' }] });
}

export async function getSubcategoryBySlug(slug: string | undefined): Promise<Subcategory | undefined> {
  if (!slug) return undefined;
  const subcategory = await prisma.subcategory.findUnique({ where: { slug } });
  return subcategory ?? undefined;
}

export interface ProductFilters {
  category?: string;
  sub?: string;
  lens?: string;
  material?: string;
  shape?: string;
  sort?: 'price-asc' | 'price-desc';
  page?: number;
}

export interface ProductResults {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductResults> {
  const where: Prisma.ProductWhereInput = {
    ...(filters.category && { categorySlug: filters.category }),
    ...(filters.sub && { subcategorySlug: filters.sub }),
    ...(filters.lens && { lensOption: filters.lens }),
    ...(filters.material && { frameMaterial: filters.material }),
    ...(filters.shape && { frameShape: filters.shape }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === 'price-asc'
      ? { price: 'asc' }
      : filters.sort === 'price-desc'
        ? { price: 'desc' }
        : { slug: 'asc' };

  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page ?? 1), totalPages);

  const rows = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return {
    items: rows.map(mapProduct),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? mapProduct(row) : undefined;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const sameSubcategory = await prisma.product.findMany({
    where: { subcategorySlug: product.subcategorySlug, slug: { not: product.slug } },
    take: limit,
  });
  if (sameSubcategory.length >= limit) return sameSubcategory.map(mapProduct);

  const sameCategory = await prisma.product.findMany({
    where: {
      categorySlug: product.categorySlug,
      slug: { notIn: [product.slug, ...sameSubcategory.map((p) => p.slug)] },
    },
    take: limit - sameSubcategory.length,
  });

  return [...sameSubcategory, ...sameCategory].map(mapProduct);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const categories = await prisma.category.findMany({
    where: { slug: { not: 'collections' } },
    orderBy: { slug: 'asc' },
  });

  const featured: PrismaProduct[] = [];
  for (const category of categories) {
    if (featured.length >= limit) break;
    const product = await prisma.product.findFirst({ where: { categorySlug: category.slug } });
    if (product) featured.push(product);
  }

  if (featured.length >= limit) return featured.map(mapProduct);

  const fallback = await prisma.product.findMany({ take: limit, orderBy: { slug: 'asc' } });
  return fallback.map(mapProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const [products, categories, subcategories] = await Promise.all([
    prisma.product.findMany(),
    prisma.category.findMany(),
    prisma.subcategory.findMany(),
  ]);

  const categoryNames = new Map(categories.map((c) => [c.slug, c.name]));
  const subcategoryNames = new Map(subcategories.map((s) => [s.slug, s.name]));

  return products
    .filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.frameMaterial,
        product.lensOption,
        product.frameShape,
        categoryNames.get(product.categorySlug),
        subcategoryNames.get(product.subcategorySlug),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalized);
    })
    .map(mapProduct);
}
