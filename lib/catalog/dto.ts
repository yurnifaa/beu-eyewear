import type { CatalogProduct, Product } from './types';

// What the browser receives for a product (cart, checkout, wishlist). `price` is what the
// shopper pays now; stockQuantity is live. Deliberately a small subset of CatalogProduct.
export interface ProductDTO extends Product {
  listPrice: number;
  compareAtPrice?: number;
  isOnSale: boolean;
  variants: { sku: string; color: string; hex?: string; available: number }[];
}

export function toProductDTO(product: CatalogProduct): ProductDTO {
  return {
    slug: product.slug,
    name: product.name,
    description: product.shortDescription || product.description,
    price: product.price,
    listPrice: product.listPrice,
    compareAtPrice: product.compareAtPrice,
    isOnSale: product.isOnSale,
    categorySlug: product.categorySlug,
    subcategorySlug: product.subcategorySlug,
    colors: product.colors,
    warrantyYears: product.warrantyYears,
    imageUrl: product.imageUrl,
    stockQuantity: product.stockQuantity,
    variants: product.variants.map(({ sku, color, hex, available }) => ({ sku, color, hex, available })),
  };
}
