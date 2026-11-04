'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PixelGlyph from '@/component/beu/PixelGlyph';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import type { ProductDTO } from '@/lib/catalog/dto';
import { formatPrice } from '@/lib/format';
import { useWishlistSlugs } from '@/lib/wishlist';

export default function WishlistSection() {
  const slugs = useWishlistSlugs();
  // Remember which list of slugs the products belong to, so "still loading"
  // can be told apart from "empty" without setting state inside the effect.
  const key = slugs.join(',');
  const [loaded, setLoaded] = useState<{ key: string; products: ProductDTO[] }>({ key: '', products: [] });

  useEffect(() => {
    if (slugs.length === 0) return;

    let cancelled = false;

    fetch('/api/products/by-slugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then((res) => res.json())
      .then((data: { products: ProductDTO[] }) => {
        if (!cancelled) setLoaded({ key, products: data.products ?? [] });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key, products: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [slugs, key]);

  const loading = slugs.length > 0 && loaded.key !== key;
  const visibleProducts = slugs.length === 0 ? [] : loaded.products;

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading your wishlist" className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {slugs.slice(0, 4).map((slug) => (
          <div key={slug} className="aspect-3/4 animate-pulse rounded-3xl bg-accent/10" />
        ))}
      </div>
    );
  }

  if (visibleProducts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-background/60 px-6 py-16 text-center backdrop-blur">
        <PixelGlyph name="heart" size={64} className="text-foreground" />
        <p className="font-display text-xl font-black uppercase tracking-[-0.03em]">Nothing saved yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">Tap the heart on any frame and it will wait for you here.</p>
        <Link
          href="/listing"
          className="mt-2 inline-flex h-12 items-center rounded-full bg-ink px-8 text-xs uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b-2 border-foreground pb-3">
        <p className="flex items-center gap-2.5 font-display text-lg font-black uppercase tracking-[-0.03em] md:text-2xl">
          <PixelGlyph name="heart" size={20} className="text-accent" />
          Your picks
        </p>
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">[ {visibleProducts.length} saved ]</span>
      </div>
      <ProductRow columns={3}>
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.slug}
            slug={product.slug}
            name={product.name}
            price={formatPrice(product.price)}
            compareAtPrice={product.compareAtPrice ? formatPrice(product.compareAtPrice) : undefined}
            description={product.description}
            href={`/listing/${product.slug}`}
            imageUrl={product.imageUrl}
            stockQuantity={product.stockQuantity}
          />
        ))}
      </ProductRow>
    </div>
  );
}
