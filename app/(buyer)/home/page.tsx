import Link from 'next/link';
import Image from 'next/image';
import { Package, Home, Clock, Star, ArrowRight } from 'lucide-react';
import { buttonClassName } from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';
import ProductCard from '@/component/ProductCard';
import ProductRow from '@/component/ProductRow';
import Reveal from '@/component/Reveal';
import SectionLabel from '@/component/SectionLabel';
import { getCategories, getProducts } from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';

// Reads live, admin-editable catalog data, so don't bake it into a static
// build-time snapshot.
export const dynamic = 'force-dynamic';

const TRUST_BADGES = [
  { icon: Package, label: 'Free Eyewear Kit Included' },
  { icon: Home, label: '7-Day Free Returns' },
  { icon: Clock, label: 'Up To 5-Year Warranty' },
];

const FEATURED_HOME_PRODUCTS = [
  {
    name: 'Tortoise Pilot Sunglasses',
    imageUrl: '/Tortoise Pilot.png',
    price: 1499,
    rating: 4.9,
    reviewCount: 84,
    href: '/listing?category=classic',
    colorSwatches: [
      { label: 'Brown', color: '#80563B' },
      { label: 'Black', color: '#202124' },
    ],
  },
  {
    name: 'Silver Cat-Eye Glasses',
    imageUrl: '/Silver Cat-Eye.png',
    price: 1499,
    rating: 4.9,
    reviewCount: 84,
    href: '/listing?category=classic',
    colorSwatches: [
      { label: 'Silver', color: '#C0C0C0' },
      { label: 'Pink', color: '#E9B7C5' },
    ],
  },
  {
    name: 'Wire Spine Oval Glasses',
    imageUrl: '/Cyber Oval Glasses.png',
    price: 1499,
    rating: 4.9,
    reviewCount: 84,
    href: '/listing?category=classic',
    colorSwatches: [
      { label: 'Light blue', color: '#B9D7E8' },
      { label: 'Tan', color: '#C2A27A' },
    ],
  },
  {
    name: 'Tech Wayfarer Glasses',
    imageUrl: '/Tech Wayfarer.png',
    price: 1499,
    rating: 4.9,
    reviewCount: 84,
    href: '/listing?category=smart',
    colorSwatches: [
      { label: 'Gray', color: '#9CA3AF' },
      { label: 'Black', color: '#202124' },
    ],
  },
];

// Figma order. Gumagana kahit "beu-classic" o "classic" ang slug.
const CATEGORY_ORDER = ['classic', 'premium', 'collections', 'smart', 'accessories'];
const categoryRank = (slug: string) => {
  const i = CATEGORY_ORDER.findIndex((key) => slug.includes(key));
  return i === -1 ? CATEGORY_ORDER.length : i;
};

// Static for now. Palitan ng DB/lib query kapag may reviews table na.
const REVIEWS = [
  {
    stars: 4,
    quote: 'The Aero-Titanium frame is so light I forget I\u2019m wearing glasses during my 10-hour screen shifts.',
    name: 'Marianne R.',
    initials: 'MR',
    tilt: '-rotate-2',
  },
  {
    stars: 5,
    quote: 'The Virtual Try-On was surprisingly accurate! The Tinted Rose fit my face shape flawlessly.',
    name: 'Ariana B.',
    initials: 'AB',
    tilt: 'rotate-1',
  },
  {
    stars: 5,
    quote: 'Student discount was quick to claim and customer service handled my prescription with immense care.',
    name: 'Rubilyn G.',
    initials: 'RG',
    tilt: 'rotate-2',
  },
];

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
    <article className="relative flex min-h-45 overflow-hidden rounded-lg border border-stone-200/80 bg-[#FAF9F5] shadow-sm transition-shadow hover:shadow-md">
      <div
        className="relative flex w-14 shrink-0 select-none items-center justify-center text-white after:absolute after:inset-y-3 after:right-0 after:border-r-2 after:border-dashed after:border-white/40 after:content-[''] sm:w-16"
        style={{
          backgroundColor: stubColor,
          backgroundImage:
            'radial-gradient(circle at 100% 14px, #FAF9F5 0 8px, transparent 8.5px), radial-gradient(circle at 100% calc(100% - 14px), #FAF9F5 0 8px, transparent 8.5px)',
        }}
      >
        <span className="rotate-180 text-xs font-semibold uppercase tracking-widest opacity-90 [writing-mode:vertical-lr]">
          {stubLabel}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 pl-6 sm:p-5 sm:pl-7">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-stone-600">{eyebrow}</p>
          <h3 className="font-serif text-lg font-bold leading-snug text-stone-900">{title}</h3>
          <div className="mt-1 text-sm text-stone-600">{detail}</div>
        </div>
        <div className="flex justify-end">
          {href && (
            <Link
              href={href}
              className={buttonClassName({
                variant: 'secondary',
                className: 'border-[#5A6DBE] bg-[#5A6DBE] px-3 py-2 text-white hover:border-[#5A6DBE] hover:bg-white hover:text-[#5A6DBE]',
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

export default async function Page() {
  const [allCategories, bundleResults, studentPickResults] = await Promise.all([
    getCategories(),
    getProducts({ category: 'collections', sub: 'bundles' }),
    getProducts({ category: 'collections', sub: 'student-picks' }),
  ]);
  // Figma shows Collections in the category row, so we no longer filter it out.
  const categories = [...allCategories].sort((a, b) => categoryRank(a.slug) - categoryRank(b.slug));
  const bundles = bundleResults.items;
  const studentPick = studentPickResults.items[0];

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
          {FEATURED_HOME_PRODUCTS.map((product) => (
            <ProductCard
              key={product.name}
              name={product.name}
              price={formatPrice(product.price)}
              imageUrl={product.imageUrl}
              href={product.href}
              rating={product.rating}
              reviewCount={product.reviewCount}
              colorSwatches={product.colorSwatches}
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
              <PlaceholderImage variant="plain" className="h-24 w-24 rounded-full md:h-28 md:w-28" />
              <span className="text-sm text-foreground md:text-base">{category.name}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Trust badges */}
      <Reveal className="bg-[#4F6BB5] px-6 py-6 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 md:flex-row md:justify-between">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={24} strokeWidth={1.5} />
              <span className="text-sm uppercase">{label}</span>
            </div>
          ))}
        </div>
      </Reveal>

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
              detail={<>Starting at <strong className="text-stone-900">{formatPrice(bundle.price)}</strong></>}
              href={`/listing/${bundle.slug}`}
              actionLabel="Shop Bundle"
            />
          ))}
          <OfferTicket
            stubLabel="5% Off"
            stubColor="#2B3A42"
            eyebrow="Student Exclusive"
            title="Student Discount"
            detail="Valid for Classic & Enhanced eyewear at checkout."
            href={studentPick ? `/listing/${studentPick.slug}` : undefined}
            actionLabel="Verify & Redeem"
          />
        </div>
      </Reveal>

      {/* Reviews */}
      <Reveal className="bg-[#EFEFEF] px-6 py-12">
        <SectionLabel>What Our Customer Says</SectionLabel>
        <div className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory px-2 py-4 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible">
          {REVIEWS.map((review) => (
            <figure
              key={review.name}
              className={`flex w-72 shrink-0 snap-start flex-col gap-3 rounded-md bg-white p-4 shadow-sm md:w-full ${review.tilt}`}
            >
              <div className="flex gap-0.5" role="img" aria-label={`${review.stars} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.stars ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}
                  />
                ))}
              </div>
              <blockquote className="text-xs italic leading-relaxed text-[#3D4A7A]">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-2 border-t pt-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8EBF5] text-[9px] font-semibold text-[#55608A]">
                  {review.initials}
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-semibold">{review.name}</span>
                  <span className="block text-[9px] text-muted-foreground">Verified Buyer</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </>
  );
}