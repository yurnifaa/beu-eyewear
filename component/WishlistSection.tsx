'use client';

import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import { getProductBySlug, formatPrice } from '@/lib/catalog/queries';
import { useWishlistSlugs } from '@/lib/wishlist';

export default function WishlistSection() {
  const slugs = useWishlistSlugs();
  const products = slugs.map(getProductBySlug).filter((product) => product !== undefined);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
        <Link href="/listing" className={buttonClassName({ variant: 'primary', className: 'uppercase' })}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <ProductRow>
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          slug={product.slug}
          name={product.name}
          price={formatPrice(product.price)}
          description={product.description}
          href={`/listing/${product.slug}`}
        />
      ))}
    </ProductRow>
  );
}
