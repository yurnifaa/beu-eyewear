import Breadcrumb from '@/component/Breadcrumb';
import CartSection from '@/component/CartSection';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';
import { formatPrice, getFeaturedProducts } from '@/lib/catalog/queries';

export default function Page() {
  const featuredProducts = getFeaturedProducts(4);

  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6">
        <Breadcrumb items={[{ label: 'Home', href: '/home' }, { label: 'Cart' }]} />
        <h1 className="mt-6 text-3xl font-bold uppercase md:text-4xl">Shopping Cart</h1>
      </Reveal>

      <Reveal mode="mount" className="px-6 py-8">
        <CartSection />
      </Reveal>

      <Reveal className="px-6 pb-14">
        <p className="text-sm font-bold uppercase tracking-wide">You May Also Like</p>
        <ProductRow className="mt-8">
          {featuredProducts.map((product) => (
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
      </Reveal>
    </>
  );
}
