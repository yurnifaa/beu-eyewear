import Link from 'next/link';
import { Wallet, Home, Clock } from 'lucide-react';
import { buttonClassName } from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';
import SectionLabel from '@/component/SectionLabel';
import { getCategories, getFeaturedProducts, getProducts } from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';

// Reads live, admin-editable catalog data — don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';

const TRUST_BADGES = [
  { icon: Wallet, label: 'Free Eyewear Kit Included' },
  { icon: Home, label: '7-Day Free Returns' },
  { icon: Clock, label: 'Up To 5-Year Warranty' },
];

export default async function Page() {
  const [allCategories, featuredProducts, bundleResults, studentPickResults] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getProducts({ category: 'collections', sub: 'bundles' }),
    getProducts({ category: 'collections', sub: 'student-picks' }),
  ]);
  const categories = allCategories.filter((category) => category.slug !== 'collections');
  const bundles = bundleResults.items;
  const studentPick = studentPickResults.items[0];

  return (
    <>
      <Reveal mode="mount" className="px-6 py-10 md:py-14">
        <PlaceholderImage variant="cross" className="aspect-[2.35/1] w-full rounded-md" />
      </Reveal>

      <Reveal className="px-6 py-14">
        <SectionLabel>Featured Products</SectionLabel>
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

      <Reveal className="px-6 py-14">
        <SectionLabel>Shop By Category</SectionLabel>
        <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-8 md:flex-nowrap md:justify-between">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/listing?category=${category.slug}`}
              className="flex basis-1/3 flex-col items-center gap-2 md:basis-auto"
            >
              <PlaceholderImage variant="plain" className="h-20 w-20 rounded-full" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{category.name}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="bg-muted px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row md:justify-between">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={20} className="text-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="px-6 py-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {bundles.map((bundle) => (
            <div key={bundle.slug} className="rounded-2xl bg-card p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bundle Offer</p>
              <p className="mt-2 text-2xl font-bold">{bundle.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">Starting at {formatPrice(bundle.price)}</p>
              <Link href={`/listing/${bundle.slug}`} className={buttonClassName({ variant: 'secondary', className: 'mt-6 bg-background' })}>
                Shop Bundle
              </Link>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal className="px-6 py-14">
        <div className="rounded-2xl bg-neutral-800 px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-bold md:text-4xl">Student Discount</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-gray-300">
            Enjoy 5% off selected Classic and Enhanced eyewear. Verify your status with a valid student ID at
            checkout.
          </p>
          {studentPick && (
            <Link
              href={`/listing/${studentPick.slug}`}
              className={buttonClassName({
                variant: 'secondary',
                className: 'mt-6 border-white bg-white text-gray-900 hover:bg-gray-100',
              })}
            >
              Verify &amp; Shop
            </Link>
          )}
        </div>
      </Reveal>

      <Reveal className="bg-muted px-6 py-14">
        <SectionLabel>What Our Customer Says</SectionLabel>
        <div className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
          {Array.from({ length: 3 }).map((_, i) => (
            <PlaceholderImage
              key={i}
              variant="plain"
              className="aspect-3/4 w-56 shrink-0 snap-start rounded-xl md:w-full"
            />
          ))}
        </div>
      </Reveal>
    </>
  );
}
