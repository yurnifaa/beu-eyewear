import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star } from 'lucide-react';
import AccordionSection from '@/component/AccordionSection';
import AddToCartSection from '@/component/AddToCartSection';
import Breadcrumb from '@/component/Breadcrumb';
import ProductImage from '@/component/ProductImage';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';
import SectionLabel from '@/component/SectionLabel';
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

// Reads live catalog data from the Google Sheet: don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'} />
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

  const studentOffer = product.isStudentEligible ? offers.find((offer) => offer.eligibility === 'STUDENT_ID') : undefined;
  const dimensions = product.dimensions;
  const dimensionsText =
    dimensions?.lensWidthMm && dimensions.bridgeWidthMm && dimensions.templeLengthMm
      ? `${dimensions.lensWidthMm}-${dimensions.bridgeWidthMm}-${dimensions.templeLengthMm} mm`
      : materialSpec?.dimensions;
  const weightText = dimensions?.weightG ? `${dimensions.weightG} g` : materialSpec?.weight;

  const specLine = product.frameMaterial
    ? `${product.frameMaterial} Frame · ${lensInfo && product.lensOption ? `${product.lensOption} Coated` : 'UV400 Clear'}`
    : subcategory?.name;

  // Only photos that exist are used; until they are uploaded the page keeps its placeholders.
  const images = [product.imageUrl, ...product.galleryUrls].filter((url): url is string => Boolean(url));
  const thumbnails = images.length > 0 ? images : [undefined, undefined, undefined, undefined];

  return (
    <>
      <Reveal mode="mount" className="px-6 pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/home' },
            ...(category ? [{ label: category.name, href: `/listing?category=${category.slug}` }] : []),
            ...(subcategory
              ? [{ label: subcategory.name, href: `/listing?category=${product.categorySlug}&sub=${subcategory.slug}` }]
              : []),
            { label: product.name },
          ]}
        />
      </Reveal>

      <Reveal mode="mount" className="grid grid-cols-1 gap-8 px-6 py-8 md:grid-cols-2">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-row gap-3 md:flex-col">
            {thumbnails.map((url, i) => (
              <ProductImage key={i} imageUrl={url} alt={product.name} sizes="64px" className="h-16 w-16 shrink-0 rounded-md" />
            ))}
          </div>
          <ProductImage
            imageUrl={images[0]}
            alt={product.name}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="aspect-3/4 flex-1 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            {specLine && <p className="mt-1 text-sm text-muted-foreground">{specLine}</p>}
            <p className="mt-3 flex items-baseline gap-2 text-lg font-semibold">
              {formatPrice(product.price)}
              {product.compareAtPrice && (
                <span className="text-sm font-normal text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </p>
            {product.reviewCount > 0 && product.rating !== undefined && (
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Stars value={product.rating} />
                {product.rating.toFixed(1)} ({product.reviewCount})
              </p>
            )}
            {studentOffer && (
              <p className="mt-2 text-xs text-muted-foreground">
                Student? {studentOffer.kind === 'PERCENT' ? `${studentOffer.value}% off` : 'A discount'} at checkout with a valid student ID.
              </p>
            )}
          </div>

          <AddToCartSection
            slug={product.slug}
            name={product.name}
            variants={product.variants.map(({ color, hex, available }) => ({ color, hex, available }))}
            lowStockThreshold={settings.lowStockThreshold}
          />

          <div>
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
                    <li key={review.id}>
                      <div className="flex items-center gap-2">
                        <Stars value={review.rating} />
                        {review.title && <span className="font-semibold text-foreground">{review.title}</span>}
                      </div>
                      <p className="mt-1">{review.body}</p>
                      <p className="mt-1 text-xs">
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

      {relatedProducts.length > 0 && (
        <Reveal className="px-6 py-14">
          <SectionLabel>You Might Also Like</SectionLabel>
          <ProductRow className="mt-8">
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
        </Reveal>
      )}
    </>
  );
}
