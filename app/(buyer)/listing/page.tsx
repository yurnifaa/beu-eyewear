import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Breadcrumb from '@/component/Breadcrumb';
import { buttonClassName } from '@/component/Button';
import FilterDropdown, { type FilterDropdownOption } from '@/component/FilterDropdown';
import PlaceholderImage from '@/component/PlaceholderImage';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';
import { FRAME_MATERIALS, FRAME_SHAPES, LENS_OPTIONS } from '@/lib/catalog/enums';
import { getCategories, getCategoryBySlug, getProducts, getSubcategories } from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';

// Reads live, admin-editable catalog data — don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';

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

function facetOptions<T extends string>(
  label: string,
  values: readonly T[],
  activeValue: string | undefined,
  paramKey: string,
  current: Params,
): FilterDropdownOption[] {
  return [
    { label: `All ${label}`, href: withParams(current, { [paramKey]: undefined, page: undefined }), active: !activeValue },
    ...values.map((value) => ({
      label: value,
      href: withParams(current, { [paramKey]: value, page: undefined }),
      active: activeValue === value,
    })),
  ];
}

function SubcategoryHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-1 text-sm font-semibold">
      <span>{children}</span>
      <ChevronRight size={16} />
    </div>
  );
}

export default async function Page(props: PageProps<'/listing'>) {
  const sp = await props.searchParams;
  const categorySlug = first(sp.category);
  const sub = first(sp.sub);
  const lens = first(sp.lens);
  const material = first(sp.material);
  const shape = first(sp.shape);
  const sort = first(sp.sort) as 'price-asc' | 'price-desc' | undefined;
  const page = Number(first(sp.page)) || 1;

  const current: Params = {
    category: categorySlug,
    sub,
    lens,
    material,
    shape,
    sort,
    page: page > 1 ? String(page) : undefined,
  };

  const categories = await getCategories();

  // Hub mode — no category picked yet, so show the tiers themselves
  // instead of dumping straight into one of them.
  if (!categorySlug) {
    return (
      <>
        <Reveal mode="mount" className="px-6 pt-6 text-center">
          <Breadcrumb items={[{ label: 'Home', href: '/home' }, { label: 'Shop' }]} />
          <h1 className="mt-8 text-3xl font-bold uppercase tracking-tight md:text-4xl">Shop</h1>
          <p className="mt-2 text-sm text-muted-foreground">Browse the full BeU lineup by collection.</p>
        </Reveal>

        <Reveal className="px-6 py-14">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/listing?category=${category.slug}`}
                className="group rounded-2xl border border-border p-6 transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md"
              >
                <PlaceholderImage variant="plain" className="aspect-video w-full rounded-xl" />
                <p className="mt-4 text-lg font-bold uppercase tracking-wide">{category.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                  Shop Now
                  <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </>
    );
  }

  const activeCategory = await getCategoryBySlug(categorySlug);
  if (!activeCategory) {
    redirect('/listing');
  }

  const subcategories = await getSubcategories(activeCategory.slug);
  const hasFilters = Boolean(sub || lens || material || shape || sort);

  const lensOptions = facetOptions('Lens Options', LENS_OPTIONS, lens, 'lens', current);
  const materialOptions = facetOptions('Frame Materials', FRAME_MATERIALS, material, 'material', current);
  const shapeOptions = facetOptions('Frame Shapes', FRAME_SHAPES, shape, 'shape', current);
  const sortOptions: FilterDropdownOption[] = [
    { label: 'Featured', href: withParams(current, { sort: undefined, page: undefined }), active: !sort },
    { label: 'Price: Low to High', href: withParams(current, { sort: 'price-asc', page: undefined }), active: sort === 'price-asc' },
    { label: 'Price: High to Low', href: withParams(current, { sort: 'price-desc', page: undefined }), active: sort === 'price-desc' },
  ];

  const results = await getProducts({
    category: activeCategory.slug,
    sub,
    lens,
    material,
    shape,
    sort,
    page,
  });

  const subcategoryRowResults = await Promise.all(
    subcategories.map(async (subcat) => ({
      subcat,
      products: (await getProducts({ category: activeCategory.slug, sub: subcat.slug })).items.slice(0, 4),
    })),
  );
  const subcategoryRows = subcategoryRowResults.filter((row) => row.products.length > 0);

  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6 text-center">
        <Breadcrumb items={[{ label: 'Home', href: '/home' }, { label: activeCategory.name }]} />
        <h1 className="mt-8 text-3xl font-bold uppercase tracking-tight md:text-4xl">{activeCategory.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{activeCategory.description}</p>
      </Reveal>

      <Reveal className="flex gap-3 overflow-x-auto px-6 py-6 md:justify-center">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/listing?category=${category.slug}`}
            className={buttonClassName({
              variant: category.slug === activeCategory.slug ? 'primary' : 'secondary',
              size: 'sm',
              className: 'shrink-0',
            })}
          >
            {category.name}
          </Link>
        ))}
      </Reveal>

      <Reveal className="flex flex-col gap-4 px-6 py-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown label="Lens Option" activeLabel={lens ? `Lens Option: ${lens}` : undefined} options={lensOptions} />
          <FilterDropdown
            label="Frame Material"
            activeLabel={material ? `Frame Material: ${material}` : undefined}
            options={materialOptions}
          />
          <FilterDropdown label="Frame Shape" activeLabel={shape ? `Frame Shape: ${shape}` : undefined} options={shapeOptions} />
        </div>
        <FilterDropdown
          label="Sort"
          activeLabel={sort ? sortOptions.find((option) => option.active)?.label : undefined}
          options={sortOptions}
        />
      </Reveal>

      {hasFilters ? (
        <Reveal className="px-6 py-8">
          {results.items.length === 0 ? (
            <p className="py-14 text-center text-sm text-muted-foreground">No products match these filters.</p>
          ) : (
            <ProductRow>
              {results.items.map((product) => (
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
          )}
        </Reveal>
      ) : (
        subcategoryRows.map(({ subcat, products }) => (
          <Reveal key={subcat.slug} className="px-6 py-8">
            <SubcategoryHeading>{subcat.name}</SubcategoryHeading>
            <ProductRow className="mt-4">
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
          </Reveal>
        ))
      )}

      {hasFilters && results.totalPages > 1 && (
        <Reveal className="flex items-center justify-center gap-3 px-6 py-14">
          {Array.from({ length: results.totalPages }).map((_, i) => {
            const n = i + 1;
            return n === results.page ? (
              <span
                key={n}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background"
              >
                {n}
              </span>
            ) : (
              <Link
                key={n}
                href={withParams(current, { page: n > 1 ? String(n) : undefined })}
                className={buttonClassName({ variant: 'ghost', size: 'sm', className: 'h-8 w-8 px-0' })}
              >
                {n}
              </Link>
            );
          })}
        </Reveal>
      )}
    </>
  );
}
