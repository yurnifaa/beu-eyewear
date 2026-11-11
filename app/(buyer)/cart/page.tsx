import type { Metadata } from 'next';
import CartLens from '@/component/cart/CartLens';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';
import { getFeaturedProducts } from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';

// Reads live, admin-editable catalog data — don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Cart' };

export default async function Page() {
  const featuredProducts = await getFeaturedProducts(4);

  return (
    <CartLens
      recommendations={
        <Reveal stagger>
          <ProductRow>
            {featuredProducts.map((product) => (
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
        </Reveal>
      }
    />
  );
}
