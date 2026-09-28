'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import type { Product } from '@/lib/catalog/types';
import { formatPrice } from '@/lib/format';
import { useWishlistSlugs } from '@/lib/wishlist';

export default function WishlistSection() {
  const slugs = useWishlistSlugs();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (slugs.length === 0) return;

    let cancelled = false;

    fetch('/api/products/by-slugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then((res) => res.json())
      .then((data: { products: Product[] }) => {
        if (!cancelled) setProducts(data.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [slugs]);

  const visibleProducts = slugs.length === 0 ? [] : products;

  if (visibleProducts.length === 0) {
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
      {visibleProducts.map((product) => (
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
