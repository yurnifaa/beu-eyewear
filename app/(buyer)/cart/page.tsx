import type { Metadata } from 'next';
import CartLens from '@/component/cart/CartLens';
import MotionProvider from '@/component/MotionProvider';
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
    // The cart's rows animate in and out (framer-motion, with layout animations), so this page loads
    // the larger engine. No other page does.
    <MotionProvider layout>
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
    </MotionProvider>
  );
}
