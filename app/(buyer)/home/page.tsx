import BenefitsBar from '@/component/BenefitsBar';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal, { RevealItem } from '@/component/Reveal';
import SectionLabel from '@/component/SectionLabel';
import CategoryRow from '@/component/home/CategoryRow';
import HomeHero from '@/component/home/HomeHero';
import HomeScrollSnap from '@/component/home/HomeScrollSnap';
import OfferTicket from '@/component/home/OfferTicket';
import PunkBand from '@/component/home/PunkBand';
import ReviewsSection from '@/component/home/ReviewsSection';
import ShapePicker, { type ShapeOption } from '@/component/home/ShapePicker';
import Spotlight from '@/component/home/Spotlight';
import {
  getCategories,
  getFeaturedProducts,
  getFilterOptions,
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

// Eyewear-shape drawings in the glyph sprite (component/beu/GlyphSprite.tsx), keyed by the
// frame_shape values in the sheet. Shapes the sheet adds later fall back to the spare drawings.
const SHAPE_GLYPHS: Record<string, string> = {
  round: 'g-round',
  rectangle: 'g-rect',
  square: 'g-shield',
  'cat-eye': 'g-butterfly',
  aviator: 'g-wrap',
};
const SPARE_GLYPHS = ['g-wrap', 'g-shield', 'g-round', 'g-butterfly', 'g-rect'];

export default async function Page() {
  // Everything below is read from the catalog sheet (featured flags, ratings, live offers,
  // featured reviews, category order, frame shapes, benefits-bar text).
  const [allCategories, featuredProducts, bundleResults, studentPickResults, offers, reviews, settings, filterOptions] =
    await Promise.all([
      getCategories(),
      getFeaturedProducts(5),
      getProducts({ category: 'collections', sub: 'bundles' }),
      getProducts({ category: 'collections', sub: 'student-picks' }),
      getOffers(),
      getFeaturedReviews(3),
      getStoreSettings(),
      getFilterOptions(),
    ]);
  const categories = [...allCategories].sort((a, b) => categoryRank(a.slug) - categoryRank(b.slug));
  const bundles = bundleResults.items;
  const studentPick = studentPickResults.items[0];
  const studentOffer = offers.find((offer) => offer.eligibility === 'STUDENT_ID');
  // Other automatic promotions running right now (no code, no eligibility check).
  const promoOffers = offers.filter((offer) => offer.eligibility === 'NONE' && !offer.requiresCode).slice(0, 2);
  const offerStub = (offer: { kind: 'PERCENT' | 'FIXED_AMOUNT'; value: number; badge: string }) =>
    offer.kind === 'PERCENT' ? `${offer.value}% Off` : offer.badge;

  const [spotlight, ...dropProducts] = featuredProducts;
  const shapes: ShapeOption[] = filterOptions.shape.map((option, index) => ({
    value: option.value,
    label: option.label,
    glyph: SHAPE_GLYPHS[option.value.toLowerCase()] ?? SPARE_GLYPHS[index % SPARE_GLYPHS.length],
  }));

  return (
    <>
      <HomeScrollSnap />
      <HomeHero />
      <PunkBand />
      <ShapePicker shapes={shapes} />
      {spotlight && <Spotlight product={spotlight} />}

      {/* The drop: featured products */}
      <Reveal stagger className="beu-snap-section px-6 py-16 md:px-14">
        <div id="drop" className="mx-auto max-w-[1328px] scroll-mt-28">
          <RevealItem>
            <SectionLabel>Featured Products</SectionLabel>
          </RevealItem>
          <RevealItem>
            <p className="mt-3 text-center font-display text-4xl font-black uppercase tracking-[-0.05em] md:text-6xl">
              Drop <span className="font-accent text-5xl normal-case md:text-7xl">01</span>
            </p>
          </RevealItem>
          <ProductRow className="mt-8">
            {dropProducts.map((product) => (
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
        </div>
      </Reveal>

      {/* Category */}
      <Reveal stagger className="beu-snap-section px-6 py-12 md:px-14">
        <RevealItem>
          <SectionLabel>Category</SectionLabel>
        </RevealItem>
        <CategoryRow categories={categories.map(({ slug, name, imageUrl }) => ({ slug, name, imageUrl }))} />
      </Reveal>

      {/* Trust badges */}
      <BenefitsBar labels={settings.benefits} />

      {/* Offers */}
      <Reveal stagger className="beu-snap-section px-6 py-16 md:px-14">
        <RevealItem>
          <SectionLabel>Offers &amp; Bundles</SectionLabel>
        </RevealItem>
        <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle, index) => (
            <OfferTicket
              key={bundle.slug}
              stubLabel={index % 2 === 0 ? 'Bundle' : 'Premium'}
              tone={index % 2 === 0 ? 'accent' : 'ink'}
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
              tone="chrome"
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
              tone="ice"
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
        <Reveal stagger className="beu-snap-section bg-ice-mist px-6 py-16 md:px-14">
          <RevealItem>
            <SectionLabel>What Our Customer Says</SectionLabel>
          </RevealItem>
          <ReviewsSection reviews={reviews} />
        </Reveal>
      )}
    </>
  );
}
