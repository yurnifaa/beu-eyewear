import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import FilterDropdown, { type FilterDropdownOption } from '@/component/FilterDropdown';
import MobileFilters, { type MobileFilterGroup } from '@/component/listing/MobileFilters';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal, { RevealItem } from '@/component/Reveal';
import CategoryChips from '@/component/listing/CategoryChips';
import CategoryTile from '@/component/listing/CategoryTile';
import ListingHero from '@/component/listing/ListingHero';
import Pagination from '@/component/listing/Pagination';
import SubcategoryHeading from '@/component/listing/SubcategoryHeading';
import { Ghost } from 'lucide-react';
import { getCategories, getCategoryBySlug, getCategoryPreviewImages, getFilterOptions, getProducts, getSubcategories } from '@/lib/catalog/queries';
import type { FilterOption } from '@/lib/catalog/types';
import { formatPrice } from '@/lib/format';

// Reads live, admin-editable catalog data — don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: PageProps<'/listing'>): Promise<Metadata> {
  const sp = await props.searchParams;
  const categorySlug = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  if (categorySlug) {
    const cat = await getCategoryBySlug(categorySlug);
    if (cat) return { title: cat.name };
  }
  return { title: 'Shop All' };
}

type Params = Record<string, string | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function withParams(current: Params, patch: Params): string {
  const merged: Params = { ...current, ...patch };
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) next.set(key, value);
  }
  const qs = next.toString();
  return qs ? `/listing?${qs}` : '/listing';
}

function facetOptions(
  label: string,
  values: readonly FilterOption[],
  activeValue: string | undefined,
  paramKey: string,
  current: Params,
): FilterDropdownOption[] {
  return [
    { label: `All ${label}`, href: withParams(current, { [paramKey]: undefined, page: undefined }), active: !activeValue },
    ...values.map((option) => ({
      label: option.label,
      href: withParams(current, { [paramKey]: option.value, page: undefined }),
      active: activeValue === option.value,
    })),
  ];
}

export default async function Page(props: PageProps<'/listing'>) {
  const sp = await props.searchParams;
  const categorySlug = first(sp.category);
  const sub = first(sp.sub);
  const lens = first(sp.lens);
  const material = first(sp.material);
  const shape = first(sp.shape);
  const color = first(sp.color);
  // Both come from the address bar, so check them instead of trusting a cast: an unknown sort is
  // ignored, and page must be a whole number (a fractional one would break the database skip).
  const rawSort = first(sp.sort);
  const sort = rawSort === 'price-asc' || rawSort === 'price-desc' ? rawSort : undefined;
  const page = Math.min(Math.max(Math.floor(Number(first(sp.page))) || 1, 1), 1000);

  const current: Params = {
    category: categorySlug,
    sub,
    lens,
    material,
    shape,
    color,
    sort,
    page: page > 1 ? String(page) : undefined,
  };

  const categoryOrder = ['classic', 'premium', 'smart', 'collections', 'accessories'];
  const categoryRank = (slug: string) => {
    const rank = categoryOrder.findIndex((key) => slug.includes(key));
    return rank === -1 ? categoryOrder.length : rank;
  };
  const [rawCategories, previewImages] = await Promise.all([getCategories(), getCategoryPreviewImages()]);
  const categories = rawCategories
    .map((category) => ({ ...category, name: category.name.replace(/^BeU\s+/i, ''), imageUrl: previewImages[category.slug] ?? category.imageUrl }))
    .sort((a, b) => categoryRank(a.slug) - categoryRank(b.slug));

  // Hub mode — no category picked yet, so show the tiers themselves
  // instead of dumping straight into one of them.
  if (!categorySlug) {
    return (
      <>
        <ListingHero
          crumbs={[{ label: 'Home', href: '/home' }, { label: 'Shop' }]}
          title="Shop"
          description="Browse the full BeU lineup by collection."
          meta={`${categories.length} collections`}
        >
          <CategoryChips categories={categories} />
        </ListingHero>

        <Reveal className="px-6 py-14 md:px-14 md:py-20">
          <div className="mx-auto grid max-w-[1328px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, i) => (
              <CategoryTile
                key={category.slug}
                slug={category.slug}
                name={category.name}
                description={category.description}
                imageUrl={category.imageUrl}
                index={i + 1}
              />
            ))}
          </div>
        </Reveal>
      </>
    );
  }

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    redirect('/listing');
  }
  const activeCategory = { ...category, name: category.name.replace(/^BeU\s+/i, '') };

  const hasFilters = Boolean(sub || lens || material || shape || color || sort);

  // None of these depend on each other, so they are fetched together. Filter choices come from the
  // lookups tab of the sheet.
  const [subcategories, filterOptions, results] = await Promise.all([
    getSubcategories(activeCategory.slug),
    getFilterOptions(),
    getProducts({
      category: activeCategory.slug,
      sub,
      lens,
      material,
      shape,
      color,
      sort,
      page,
    }),
  ]);
  const lensOptions = facetOptions('Lens Options', filterOptions.lens, lens, 'lens', current);
  const materialOptions = facetOptions('Frame Materials', filterOptions.material, material, 'material', current);
  const shapeOptions = facetOptions('Frame Shapes', filterOptions.shape, shape, 'shape', current);
  const colorOptions = facetOptions('Colors', filterOptions.color, color, 'color', current);
  const sortOptions: FilterDropdownOption[] = [
    { label: 'Featured', href: withParams(current, { sort: undefined, page: undefined }), active: !sort },
    { label: 'Price: Low to High', href: withParams(current, { sort: 'price-asc', page: undefined }), active: sort === 'price-asc' },
    { label: 'Price: High to Low', href: withParams(current, { sort: 'price-desc', page: undefined }), active: sort === 'price-desc' },
  ];

  const subcategoryRowResults = await Promise.all(
    subcategories.map(async (subcat) => ({
      subcat,
      products: (await getProducts({ category: activeCategory.slug, sub: subcat.slug })).items.slice(0, 4),
    })),
  );
  const subcategoryRows = subcategoryRowResults.filter((row) => row.products.length > 0);

  const renderCard = (product: (typeof results.items)[number]) => (
    <ProductCard
      key={product.slug}
      slug={product.slug}
      name={product.name}
      price={formatPrice(product.price)}
      compareAtPrice={product.compareAtPrice ? formatPrice(product.compareAtPrice) : undefined}
      description={product.shortDescription || product.description}
      href={`/listing/${product.slug}`}
      imageUrl={product.imageUrl}
      stockQuantity={product.stockQuantity}
    />
  );

  // Subcategory rows are previews; the paginated list shows when filtering, or
  // when the category has no subcategory rows to preview.
  const showsResults = hasFilters || subcategoryRows.length === 0;
  const clearHref = `/listing?category=${activeCategory.slug}`;
  const pageHref = (n: number) => withParams(current, { page: n > 1 ? String(n) : undefined });

  // Phone filter bar: the same facets as the dropdowns, as sheet groups plus removable chips.
  const allFacetGroups: MobileFilterGroup[] = [
    { key: 'lens', title: 'Lens option', options: filterOptions.lens, active: lens },
    { key: 'material', title: 'Frame material', options: filterOptions.material, active: material },
    { key: 'shape', title: 'Frame shape', options: filterOptions.shape, active: shape },
    { key: 'color', title: 'Color', options: filterOptions.color, active: color },
  ];
  const facetGroups = allFacetGroups.filter((group) => group.options.length > 0);
  const filterChips = facetGroups.flatMap((group) =>
    group.active
      ? [
          {
            label: group.options.find((option) => option.value === group.active)?.label ?? group.active,
            aria: `Remove ${group.title.toLowerCase()} filter`,
            href: withParams(current, { [group.key]: undefined, page: undefined }),
          },
        ]
      : [],
  );
  const mobileBaseParams: Record<string, string> = { category: activeCategory.slug };
  if (sub) mobileBaseParams.sub = sub;
  if (sort) mobileBaseParams.sort = sort;
  const mobileSortLabel = sort === 'price-asc' ? 'Low–High' : sort === 'price-desc' ? 'High–Low' : 'Sort';

  return (
    <>
      <ListingHero
        crumbs={[{ label: 'Home', href: '/home' }, { label: 'Shop', href: '/listing' }, { label: activeCategory.name }]}
        title={activeCategory.name}
        description={activeCategory.description}
        meta={`${results.total} ${results.total === 1 ? 'piece' : 'pieces'}`}
      >
        <CategoryChips categories={categories} activeSlug={activeCategory.slug} />
      </ListingHero>

      {/* Filter bar overlaps the bottom edge of the hero band. */}
      <div className="relative z-10 -mt-7 px-6 md:px-14">
        <Reveal mode="mount" className="beu-bar relative mx-auto max-w-[1328px] rounded-[1.75rem] p-2 md:rounded-full md:p-3 md:px-4">
          <div className="md:hidden">
            <MobileFilters
              groups={facetGroups}
              baseParams={mobileBaseParams}
              sortOptions={sortOptions}
              sortLabel={mobileSortLabel}
              chips={filterChips}
              clearHref={clearHref}
            />
          </div>
          <div className="hidden flex-wrap items-center justify-between gap-2 md:flex">
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown label="Lens Option" activeLabel={lens ? `Lens Option: ${lens}` : undefined} options={lensOptions} />
            <FilterDropdown
              label="Frame Material"
              activeLabel={material ? `Frame Material: ${material}` : undefined}
              options={materialOptions}
            />
            <FilterDropdown label="Frame Shape" activeLabel={shape ? `Frame Shape: ${shape}` : undefined} options={shapeOptions} />
            {filterOptions.color.length > 0 && (
              <FilterDropdown
                label="Color"
                activeLabel={color ? `Color: ${filterOptions.color.find((option) => option.value === color)?.label ?? color}` : undefined}
                options={colorOptions}
              />
            )}
            {hasFilters && (
              <Link href={clearHref} className="px-2 text-xs uppercase tracking-[0.12em] underline underline-offset-4 transition-opacity hover:opacity-70">
                Clear all
              </Link>
            )}
          </div>
          <FilterDropdown
            label="Sort"
            align="right"
            activeLabel={sort ? sortOptions.find((option) => option.active)?.label : undefined}
            options={sortOptions}
          />
          </div>
        </Reveal>
      </div>

      {hasFilters ? (
        <Reveal stagger className="px-6 py-12 md:px-14 md:py-16">
          <div className="mx-auto max-w-[1328px]">
            {results.items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <Ghost size={56} strokeWidth={1.5} aria-hidden="true" className="text-foreground" />
                <p className="font-display text-xl font-black uppercase tracking-[-0.03em] md:text-2xl">Nothing here. Yet.</p>
                <p className="max-w-sm text-sm text-muted-foreground">No products match these filters. Loosen one up and try again.</p>
                <Link href={clearHref} className="beu-chip inline-flex h-10 items-center px-5 text-xs uppercase tracking-[0.12em]">
                  Clear filters
                </Link>
              </div>
            ) : (
              <ProductRow>{results.items.map(renderCard)}</ProductRow>
            )}
          </div>
        </Reveal>
      ) : (
        subcategoryRows.map(({ subcat, products }, i) => (
          <Reveal stagger key={subcat.slug} className="px-6 pb-4 pt-12 md:px-14 md:pt-16">
            <div className="mx-auto max-w-[1328px]">
              <RevealItem>
                <SubcategoryHeading
                  name={subcat.name}
                  href={`/listing?category=${activeCategory.slug}&sub=${subcat.slug}`}
                  index={i + 1}
                  total={subcategoryRows.length}
                />
              </RevealItem>
              <ProductRow className="mt-6">{products.map(renderCard)}</ProductRow>
            </div>
          </Reveal>
        ))
      )}

      {showsResults && !hasFilters && results.items.length > 0 && (
        <Reveal stagger className="px-6 py-12 md:px-14 md:py-16">
          <div className="mx-auto max-w-[1328px]">
            <ProductRow>{results.items.map(renderCard)}</ProductRow>
          </div>
        </Reveal>
      )}

      {showsResults && results.totalPages > 1 && (
        <Reveal className="px-6 py-14 md:px-14">
          <Pagination page={results.page} totalPages={results.totalPages} hrefFor={pageHref} />
        </Reveal>
      )}

      <div className="h-10 md:h-16" />
    </>
  );
}
