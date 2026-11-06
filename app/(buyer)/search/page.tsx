import Link from 'next/link';
import { Search } from 'lucide-react';
import PixelGlyph from '@/component/beu/PixelGlyph';
import CategoryChips from '@/component/listing/CategoryChips';
import ListingHero from '@/component/listing/ListingHero';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';
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

  const meta = query ? `${results.length} result${results.length === 1 ? '' : 's'}` : undefined;

  return (
    <>
      <ListingHero
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'Search' }]}
        title={query ? 'Results' : 'Search'}
        description={
          query
            ? undefined
            : 'Search for frames, lenses, or accessories — or jump straight into a collection.'
        }
        meta={meta}
      >
        <form
          role="search"
          action="/search"
          className="beu-bar mx-auto flex h-14 max-w-xl items-center gap-3 rounded-full pl-5 pr-2 focus-within:ring-2 focus-within:ring-accent/40"
        >
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
            className="h-full w-full bg-transparent text-base md:text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-full bg-ink px-5 text-xs uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
          >
            Search
          </button>
        </form>
        {(!query || results.length === 0) && (
          <div className="mt-6">
            <CategoryChips categories={categories} />
          </div>
        )}
      </ListingHero>

      {query && results.length === 0 && (
        <Reveal className="px-6 py-14 md:px-14 md:py-20">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-background/60 px-6 py-14 text-center backdrop-blur">
            <PixelGlyph name="cross" size={56} className="text-foreground" />
            <h2 className="font-display text-xl font-black uppercase tracking-[-0.03em]">Nothing found</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;. Try a shorter word, or browse the full lineup.
            </p>
            <Link
              href="/listing"
              className="mt-2 inline-flex h-12 items-center rounded-full bg-ink px-8 text-xs uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
            >
              Browse all products
            </Link>
          </div>
        </Reveal>
      )}

      {query && results.length > 0 && (
        <Reveal className="px-6 py-12 md:px-14 md:py-16">
          <div className="mx-auto max-w-[1328px]">
            <p className="mb-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Showing results for <span className="text-foreground">&ldquo;{query}&rdquo;</span>
            </p>
            <ProductRow>
              {results.map((product) => (
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
        </Reveal>
      )}
    </>
  );
}
