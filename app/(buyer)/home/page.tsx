import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight } from 'lucide-react';
import BenefitsBar from '@/component/BenefitsBar';
import { buttonClassName } from '@/component/Button';
import ProductCard from '@/component/ProductCard';
import ProductImage from '@/component/ProductImage';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';
import SectionLabel from '@/component/SectionLabel';
import {
  getCategories,
  getFeaturedProducts,
  getFeaturedReviews,
  getOffers,
  getProducts,
  getStoreSettings,
} from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';

// Reads live, admin-editable catalog data, so don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';

// Figma order. Gumagana kahit "beu-classic" o "classic" ang slug.
const CATEGORY_ORDER = ['classic', 'premium', 'smart', 'collections', 'accessories'];
const categoryRank = (slug: string) => {
  const i = CATEGORY_ORDER.findIndex((key) => slug.includes(key));
  return i === -1 ? CATEGORY_ORDER.length : i;
};

function OfferTicket({
  stubLabel,
  stubColor,
  eyebrow,
  title,
  detail,
  href,
  actionLabel,
}: {
  stubLabel: string;
  stubColor: string;
  eyebrow: string;
  title: string;
  detail: React.ReactNode;
  href?: string;
  actionLabel: string;
}) {
  return (
    <article className="relative flex min-h-45 overflow-hidden rounded-lg border border-border bg-[#FAF9F5] shadow-sm transition-shadow hover:shadow-md dark:bg-card">
      <div
        className="relative flex w-14 shrink-0 select-none items-center justify-center text-white after:absolute after:inset-y-3 after:right-0 after:border-r-2 after:border-dashed after:border-white/40 after:content-[''] sm:w-16"
        style={{
          backgroundColor: stubColor,
        }}
      >
        <span aria-hidden="true" className="absolute -right-2 top-2 h-4 w-4 rounded-full bg-[#FAF9F5] dark:bg-card" />
        <span aria-hidden="true" className="absolute -right-2 bottom-2 h-4 w-4 rounded-full bg-[#FAF9F5] dark:bg-card" />
        <span className="rotate-180 text-xs font-semibold uppercase tracking-widest opacity-90 [writing-mode:vertical-lr]">
          {stubLabel}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 pl-6 sm:p-5 sm:pl-7">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
          <h3 className="font-serif text-lg font-bold leading-snug text-foreground">{title}</h3>
          <div className="mt-1 text-sm text-muted-foreground">{detail}</div>
        </div>
        <div className="flex justify-end">
          {href && (
            <Link
              href={href}
              className={buttonClassName({
                variant: 'secondary',
                className: 'border-[#5A6DBE] bg-[#5A6DBE] px-3 py-2 text-white hover:border-[#5A6DBE] hover:bg-white hover:text-[#5A6DBE] dark:hover:bg-[#161928] dark:hover:text-white',
              })}
            >
              {actionLabel}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

const TILTS = ['-rotate-2', 'rotate-1', 'rotate-2'];

export default async function Page() {
  // Everything below is read from the catalog sheet (featured flags, ratings, live offers,
  // featured reviews, category order, benefits-bar text).
  const [allCategories, featuredProducts, bundleResults, studentPickResults, offers, reviews, settings] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getProducts({ category: 'collections', sub: 'bundles' }),
    getProducts({ category: 'collections', sub: 'student-picks' }),
    getOffers(),
    getFeaturedReviews(3),
    getStoreSettings(),
  ]);
  // Figma shows Collections in the category row, so we no longer filter it out.
  const categories = [...allCategories].sort((a, b) => categoryRank(a.slug) - categoryRank(b.slug));
  const bundles = bundleResults.items;
  const studentPick = studentPickResults.items[0];
  const studentOffer = offers.find((offer) => offer.eligibility === 'STUDENT_ID');
  // Other automatic promotions running right now (no code, no eligibility check).
  const promoOffers = offers.filter((offer) => offer.eligibility === 'NONE' && !offer.requiresCode).slice(0, 2);
  const offerStub = (offer: { kind: 'PERCENT' | 'FIXED_AMOUNT'; value: number; badge: string }) =>
    offer.kind === 'PERCENT' ? `${offer.value}% Off` : offer.badge;

  return (
    <>
      {/* Hero */}
      <Reveal mode="mount" className="px-6 py-8 md:py-10">
        <div className="relative aspect-[2.7/1] w-full overflow-hidden rounded-sm bg-[#F8F8F8]">
          <Image
            src="/hero-glasses.png"
            alt="Silver BeU eyeglasses"
            fill
            priority
            sizes="(max-width: 768px) 100vw, calc(100vw - 3rem)"
            className="object-contain"
          />
        </div>
      </Reveal>

      {/* Featured products */}
      <Reveal className="px-6 py-10">
        <SectionLabel>Featured Products</SectionLabel>
        <ProductRow className="mt-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.slug}
              slug={product.slug}
              name={product.name}
              price={formatPrice(product.price)}
              compareAtPrice={product.compareAtPrice ? formatPrice(product.compareAtPrice) : undefined}
              imageUrl={product.imageUrl}
              href={`/listing/${product.slug}`}
              rating={product.rating ?? 0}
              reviewCount={product.reviewCount}
              stockQuantity={product.stockQuantity}
              colorSwatches={product.variants
                .filter((variant) => variant.hex && variant.color !== 'Standard')
                .slice(0, 3)
                .map((variant) => ({ label: variant.color, color: variant.hex as string }))}
            />
          ))}
        </ProductRow>
      </Reveal>

      {/* Category */}
      <Reveal className="px-6 py-10">
        <SectionLabel>Category</SectionLabel>
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-8 md:flex-nowrap md:gap-x-10 lg:gap-x-14">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/listing?category=${category.slug}`}
              className="flex basis-1/3 flex-col items-center gap-4 md:w-32 md:basis-auto"
            >
              <ProductImage
                imageUrl={category.imageUrl}
                alt={category.name}
                sizes="112px"
                className="h-24 w-24 rounded-full md:h-28 md:w-28"
              />
              <span className="text-sm text-foreground md:text-base">{category.name.replace(/^BeU\s+/i, '')}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Trust badges */}
      <BenefitsBar labels={settings.benefits} />

      {/* Offers */}
      <Reveal className="px-6 py-10">
        <SectionLabel>Offers &amp; Bundles</SectionLabel>
        <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle, index) => (
            <OfferTicket
              key={bundle.slug}
              stubLabel={index % 2 === 0 ? 'Bundle' : 'Premium'}
              stubColor={index % 2 === 0 ? '#5A6DBE' : '#3B4E99'}
              eyebrow="Special Bundle"
              title={bundle.name}
              detail={<>Starting at <strong className="text-foreground">{formatPrice(bundle.price)}</strong></>}
              href={`/listing/${bundle.slug}`}
              actionLabel="Shop Bundle"
            />
          ))}
          {promoOffers.map((offer) => (
            <OfferTicket
              key={offer.id}
              stubLabel={offerStub(offer)}
              stubColor="#4F6BB5"
              eyebrow="Limited Offer"
              title={offer.name}
              detail={offer.description}
              href="/listing"
              actionLabel="Shop Now"
            />
          ))}
          {studentOffer && (
            <OfferTicket
              stubLabel={offerStub(studentOffer)}
              stubColor="#2F7A5A"
              eyebrow="Student Exclusive"
              title={studentOffer.name}
              detail={studentOffer.description}
              href={studentPick ? `/listing/${studentPick.slug}` : undefined}
              actionLabel="Verify & Redeem"
            />
          )}
        </div>
      </Reveal>

      {/* Reviews */}
      {reviews.length > 0 && (
        <Reveal className="bg-muted px-6 py-12">
          <SectionLabel>What Our Customer Says</SectionLabel>
          <div className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory px-2 py-4 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible">
            {reviews.map((review, index) => (
              <figure
                key={review.id}
                className={`flex w-72 shrink-0 snap-start flex-col gap-3 rounded-md bg-background p-4 shadow-sm md:w-full ${TILTS[index % TILTS.length]}`}
              >
                <div className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}
                    />
                  ))}
                </div>
                <blockquote className="text-xs italic leading-relaxed text-muted-foreground">
                  &ldquo;{review.body}&rdquo;
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-2 border-t border-border pt-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-[9px] font-semibold text-foreground">
                    {review.authorInitials}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-xs font-semibold">{review.authorName}</span>
                    <span className="block text-[9px] text-muted-foreground">
                      {review.isVerifiedPurchase ? 'Verified Buyer' : 'Customer'}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      )}
    </>
  );
}
