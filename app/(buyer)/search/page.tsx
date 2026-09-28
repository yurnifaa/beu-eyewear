import Link from 'next/link';
import { Search } from 'lucide-react';
import Breadcrumb from '@/component/Breadcrumb';
import { buttonClassName } from '@/component/Button';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';
import SectionLabel from '@/component/SectionLabel';
import { getCategories, searchProducts } from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';

// Reads live, admin-editable catalog data — don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function SearchPage(props: PageProps<'/search'>) {
  const sp = await props.searchParams;
  const raw = sp.q;
  const query = (Array.isArray(raw) ? raw[0] : raw ?? '').trim();
  const [results, categories] = await Promise.all([
    query ? searchProducts(query) : Promise.resolve([]),
    getCategories(),
  ]);

  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6">
        <Breadcrumb items={[{ label: 'Home', href: '/home' }, { label: 'Search' }]} />
        <h1 className="mt-6 text-3xl font-bold uppercase md:text-4xl">Search</h1>
      </Reveal>

      <Reveal mode="mount" className="px-6 py-6">
        <form role="search" action="/search" className="flex max-w-xl items-center gap-2 rounded-xl border border-border px-4 py-3">
          <Search size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="search-input" className="sr-only">
            Search products
          </label>
          <input
            id="search-input"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search frames, lenses, accessories..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
      </Reveal>

      {!query ? (
        <Reveal className="px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            Search for frames, lenses, or accessories — or jump straight into a collection.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/listing?category=${category.slug}`}
                className={buttonClassName({ variant: 'secondary', size: 'sm' })}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </Reveal>
      ) : results.length === 0 ? (
        <Reveal className="px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;.</p>
          <Link href="/listing" className={buttonClassName({ variant: 'primary', className: 'mt-6 uppercase' })}>
            Browse All Products
          </Link>
        </Reveal>
      ) : (
        <Reveal className="px-6 py-8">
          <SectionLabel>
            {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
          </SectionLabel>
          <ProductRow className="mt-8">
            {results.map((product) => (
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
      )}
    </>
  );
}
