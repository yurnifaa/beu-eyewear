import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import AccordionSection from '@/component/AccordionSection';
import AddToCartSection from '@/component/AddToCartSection';
import PixelGlyph from '@/component/beu/PixelGlyph';
import Crumbs from '@/component/listing/Crumbs';
import SubcategoryHeading from '@/component/listing/SubcategoryHeading';
import ColorGallery from '@/component/product/ColorGallery';
import ProductColorProvider from '@/component/product/ProductColorProvider';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal, { RevealItem } from '@/component/Reveal';
import {
  getBundleComponents,
  getCategoryBySlug,
  getFrameMaterialDetail,
  getLensOptionDetail,
  getOffers,
  getProductBySlug,
  getProductReviews,
  getProductsBySlugs,
  getRelatedProducts,
  getStoreSettings,
  getSubcategoryBySlug,
} from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';

// Reads live catalog data from the database: don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < Math.round(value) ? 'fill-foreground text-foreground' : 'text-border'} />
      ))}
    </span>
  );
}

export default async function Page(props: PageProps<'/listing/[slug]'>) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [category, subcategory, relatedProducts, materialSpec, lensInfo, reviews, bundleComponents, offers, settings, compatible] =
    await Promise.all([
      getCategoryBySlug(product.categorySlug),
      getSubcategoryBySlug(product.subcategorySlug),
      getRelatedProducts(product, 4),
      getFrameMaterialDetail(product.frameMaterial),
      getLensOptionDetail(product.lensOption),
      getProductReviews(product.slug),
      getBundleComponents(product.slug),
      getOffers(),
      getStoreSettings(),
      getProductsBySlugs(product.compatibleWith),
    ]);

  const dimensions = product.dimensions;
  const dimensionsText =
    dimensions?.lensWidthMm && dimensions.bridgeWidthMm && dimensions.templeLengthMm
      ? `${dimensions.lensWidthMm}-${dimensions.bridgeWidthMm}-${dimensions.templeLengthMm} mm`
      : materialSpec?.dimensions;
  const weightText = dimensions?.weightG ? `${dimensions.weightG} g` : materialSpec?.weight;

  const specLine = product.frameMaterial
    ? `${product.frameMaterial} Frame · ${lensInfo && product.lensOption ? `${product.lensOption} Coated` : 'UV400 Clear'}`
    : subcategory?.name;

  const categoryName = category?.name.replace(/^BeU\s+/i, '');
  const onSale = Boolean(product.compareAtPrice);
  const perks = [
    { glyph: 'bolt' as const, label: `${product.returnWindowDays}-day free returns` },
    { glyph: 'star5' as const, label: `${product.warrantyYears}-year warranty` },
    ...(product.hasEyewearKit ? [{ glyph: 'spark' as const, label: 'Free case + cloth' }] : []),
  ];

  return (
    <>
      <section className="beu-pdp-bg relative isolate -mt-[var(--beu-header-h)] overflow-hidden">
        {/* Texture fades out before the band ends so there is no hard edge. */}
        <div aria-hidden="true" className="absolute inset-0 [mask-image:linear-gradient(180deg,#000_0%,#000_45%,transparent_92%)]">
          <div className="beu-band-grid absolute inset-0" />
          <div className="beu-band-dots absolute inset-0" />
        </div>
        <PixelGlyph name="cross" size={34} className="absolute right-[6%] top-[calc(var(--beu-header-h)+3rem)] z-[1] hidden text-foreground lg:block" />

        <div className="relative z-[2] mx-auto max-w-[1328px] px-6 pb-16 pt-[calc(var(--beu-header-h)+1.25rem)] md:px-14 md:pb-24">
          <Reveal mode="mount">
            <Crumbs
              crumbs={[
                { label: 'Home', href: '/home' },
                ...(category ? [{ label: categoryName ?? category.name, href: `/listing?category=${category.slug}` }] : []),
                ...(subcategory
                  ? [{ label: subcategory.name, href: `/listing?category=${product.categorySlug}&sub=${subcategory.slug}` }]
                  : []),
                { label: product.name },
              ]}
            />
          </Reveal>

          {/* The selected color is shared by the gallery and the swatches; the gallery shows that color's
              photos (placeholders until it has any). */}
          <ProductColorProvider
            variants={product.variants.map(({ color, available, imageUrls }) => ({ color, available, images: imageUrls }))}
          >
          <Reveal mode="mount" delay={0.05} className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ColorGallery alt={product.name} />
            </div>

            <div className="flex min-w-0 flex-col gap-7">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
                  {categoryName && <span className="beu-chip px-3 py-1.5">{categoryName}</span>}
                  {subcategory && <span className="text-muted-foreground">{subcategory.name}</span>}
                </div>
                <h1 className="mt-5 text-balance font-display text-3xl font-black uppercase leading-[1.02] tracking-[-0.03em] md:text-5xl">
                  {product.name}
                </h1>
                {specLine && <p className="mt-3 text-sm text-muted-foreground">{specLine}</p>}

                <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="font-display text-3xl font-black tracking-[-0.03em] md:text-4xl">{formatPrice(product.price)}</span>
                  {product.compareAtPrice && (
                    <span className="text-base text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
                  )}
                  {onSale && (
                    <span className="rounded-full bg-accent px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-on-accent">Sale</span>
                  )}
                </p>

                {product.reviewCount > 0 && product.rating !== undefined && (
                  <p className="mt-3 flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Stars value={product.rating} />
                    <span className="text-foreground">{product.rating.toFixed(1)}</span>
                    <span>({product.reviewCount} reviews)</span>
                  </p>
                )}

              </div>

              <AddToCartSection
                slug={product.slug}
                name={product.name}
                variants={product.variants.map(({ color, hex, available }) => ({ color, hex, available }))}
                lowStockThreshold={settings.lowStockThreshold}
              />

              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {perks.map((perk) => (
                  <li
                    key={perk.label}
                    className="flex items-center gap-2.5 rounded-2xl border border-border bg-background/60 px-3.5 py-3 text-[11px] uppercase leading-snug tracking-[0.1em] backdrop-blur"
                  >
                    <PixelGlyph name={perk.glyph} size={18} className="shrink-0 text-accent" />
                    {perk.label}
                  </li>
                ))}
              </ul>

              <div className="border-t-2 border-foreground">
            <AccordionSection title="Product Details" defaultOpen>
              <p>{product.description}</p>
              {product.features.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              )}
              {(materialSpec || dimensionsText) && (
                <ul className="mt-2 list-disc pl-5">
                  {dimensionsText && <li>Dimensions (Eye-Bridge-Temple): {dimensionsText}</li>}
                  {weightText && <li>Weight: {weightText}</li>}
                  {materialSpec && <li>Material: {materialSpec.composition}</li>}
                  {(product.nosePadType ?? materialSpec?.nosePad) && <li>Nose Pads: {product.nosePadType ?? materialSpec?.nosePad}</li>}
                  {product.hasEyewearKit && (
                    <li>Includes a protective case and microfiber cleaning cloth at no additional cost.</li>
                  )}
                </ul>
              )}
              {compatible.length > 0 && (
                <p className="mt-2">
                  Works with:{' '}
                  {compatible.map((item, index) => (
                    <span key={item.slug}>
                      {index > 0 && ', '}
                      <Link href={`/listing/${item.slug}`} className="underline underline-offset-2">
                        {item.name}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </AccordionSection>
            {bundleComponents.length > 0 && (
              <AccordionSection title="What's Included">
                <ul className="list-disc pl-5">
                  {bundleComponents.map((component) => (
                    <li key={component.name}>
                      {component.quantity > 1 ? `${component.quantity} × ` : ''}
                      {component.slug ? (
                        <Link href={`/listing/${component.slug}`} className="underline underline-offset-2">
                          {component.name}
                        </Link>
                      ) : (
                        component.name
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionSection>
            )}
            {lensInfo && (
              <AccordionSection title="Lens & Coating">
                <p>{lensInfo.description}</p>
                {lensInfo.metric && <p className="mt-2">{lensInfo.metric}</p>}
              </AccordionSection>
            )}
            <AccordionSection title="Shipping & Return Details">
              <p>
                Free returns within {product.returnWindowDays} days of delivery. This product is covered by a {product.warrantyYears}
                -year manufacturer&apos;s warranty against defects.
              </p>
            </AccordionSection>
            <AccordionSection
              title={`Reviews & Ratings (${product.reviewCount})`}
              extra={<Stars value={product.rating ?? 0} />}
            >
              {reviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                <ul className="flex flex-col gap-4">
                  {reviews.map((review) => (
                    <li key={review.id} className="rounded-2xl border border-border bg-background/60 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Stars value={review.rating} />
                        {review.title && <span className="font-semibold text-foreground">{review.title}</span>}
                      </div>
                      <p className="mt-1">{review.body}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em]">
                        {review.authorName}
                        {review.isVerifiedPurchase ? ' · Verified Buyer' : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionSection>
              </div>
            </div>
          </Reveal>
          </ProductColorProvider>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <Reveal stagger className="px-6 pb-16 pt-6 md:px-14 md:pb-24">
          <div className="mx-auto max-w-[1328px]">
          <RevealItem>
            <SubcategoryHeading name="You might also like" />
          </RevealItem>
          <ProductRow className="mt-6">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.slug}
                slug={related.slug}
                name={related.name}
                price={formatPrice(related.price)}
                compareAtPrice={related.compareAtPrice ? formatPrice(related.compareAtPrice) : undefined}
                description={related.shortDescription || related.description}
                href={`/listing/${related.slug}`}
                imageUrl={related.imageUrl}
                stockQuantity={related.stockQuantity}
              />
            ))}
          </ProductRow>
          </div>
        </Reveal>
      )}
    </>
  );
}
