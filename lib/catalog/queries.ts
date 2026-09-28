import { CATEGORIES, PRODUCTS, SUBCATEGORIES } from './data';
import type { Category, CategorySlug, Product, Subcategory } from './types';

const PAGE_SIZE = 8;

export function getCategories(): Category[] {
  return CATEGORIES;
}

export function getCategoryBySlug(slug: string | undefined): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getSubcategories(categorySlug: CategorySlug): Subcategory[] {
  return SUBCATEGORIES.filter((sub) => sub.categorySlug === categorySlug);
}

export function getSubcategoryBySlug(slug: string | undefined): Subcategory | undefined {
  return SUBCATEGORIES.find((sub) => sub.slug === slug);
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

export function getProducts(filters: ProductFilters = {}): ProductResults {
  let items = PRODUCTS.filter((product) => {
    if (filters.category && product.categorySlug !== filters.category) return false;
    if (filters.sub && product.subcategorySlug !== filters.sub) return false;
    if (filters.lens && product.lensOption !== filters.lens) return false;
    if (filters.material && product.frameMaterial !== filters.material) return false;
    if (filters.shape && product.frameShape !== filters.shape) return false;
    return true;
  });

  if (filters.sort === 'price-asc') {
    items = [...items].sort((a, b) => a.price - b.price);
  } else if (filters.sort === 'price-desc') {
    items = [...items].sort((a, b) => b.price - a.price);
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page ?? 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;

  return {
    items: items.slice(start, start + PAGE_SIZE),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameSubcategory = PRODUCTS.filter(
    (candidate) => candidate.subcategorySlug === product.subcategorySlug && candidate.slug !== product.slug,
  );
  if (sameSubcategory.length >= limit) return sameSubcategory.slice(0, limit);

  const sameCategory = PRODUCTS.filter(
    (candidate) =>
      candidate.categorySlug === product.categorySlug &&
      candidate.slug !== product.slug &&
      !sameSubcategory.includes(candidate),
  );

  return [...sameSubcategory, ...sameCategory].slice(0, limit);
}

export function getFeaturedProducts(limit = 4): Product[] {
  const seen = new Set<CategorySlug>();
  const featured: Product[] = [];

  for (const product of PRODUCTS) {
    if (product.categorySlug === 'collections' || seen.has(product.categorySlug)) continue;
    seen.add(product.categorySlug);
    featured.push(product);
    if (featured.length >= limit) break;
  }

  return featured.length >= limit ? featured : PRODUCTS.slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return PRODUCTS.filter((product) => {
    const category = getCategoryBySlug(product.categorySlug);
    const subcategory = getSubcategoryBySlug(product.subcategorySlug);
    const haystack = [
      product.name,
      product.description,
      product.frameMaterial,
      product.lensOption,
      product.frameShape,
      category?.name,
      subcategory?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function formatPrice(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}
