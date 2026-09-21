import { Wallet, Home, Clock } from 'lucide-react';
import Button from '@/component/Button';
import PlaceholderImage from '@/component/PlaceholderImage';
import Reveal from '@/component/Reveal';
import SectionLabel from '@/component/SectionLabel';

const CATEGORIES = ['Classic', 'Premium', 'Collections', 'Smart', 'Accessories'];

const TRUST_BADGES = [
  { icon: Wallet, label: 'Free Eyewear Kit Included' },
  { icon: Home, label: '7-Day Free Returns' },
  { icon: Clock, label: 'Up To 5-Year Warranty' },
];

const BUNDLES = [
  { title: 'BeU Classic + Care', price: 'Starting at ₱1,199' },
  { title: 'BeU Premium + Care', price: 'Starting at ₱4,999' },
];

export default function Page() {
  return (
    <>
      <Reveal mode="mount" className="px-6 py-10 md:py-14">
        <PlaceholderImage variant="cross" className="aspect-[2.35/1] w-full rounded-md" />
      </Reveal>

      <Reveal className="px-6 py-14">
        <SectionLabel>Featured Products</SectionLabel>
        <div className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
          {Array.from({ length: 4 }).map((_, i) => (
            <PlaceholderImage
              key={i}
              variant="plain"
              className="aspect-[3/4] w-40 shrink-0 snap-start rounded-xl md:w-full"
            />
          ))}
        </div>
      </Reveal>

      <Reveal className="px-6 py-14">
        <SectionLabel>Shop By Category</SectionLabel>
        <div className="mt-8 flex flex-wrap justify-center gap-x-10 gap-y-8 md:flex-nowrap md:justify-between">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex basis-1/3 flex-col items-center gap-2 md:basis-auto">
              <PlaceholderImage variant="plain" className="h-20 w-20 rounded-full" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{category}</span>
            </div>
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
          {BUNDLES.map(({ title, price }) => (
            <div key={title} className="rounded-2xl bg-card p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bundle Offer</p>
              <p className="mt-2 text-2xl font-bold">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{price}</p>
              <Button variant="secondary" className="mt-6 bg-background">
                Shop Bundle
              </Button>
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
          <Button variant="secondary" className="mt-6 border-white bg-white text-gray-900 hover:bg-gray-100">
            Verify &amp; Shop
          </Button>
        </div>
      </Reveal>

      <Reveal className="bg-muted px-6 py-14">
        <SectionLabel>What Our Customer Says</SectionLabel>
        <div className="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
          {Array.from({ length: 3 }).map((_, i) => (
            <PlaceholderImage
              key={i}
              variant="plain"
              className="aspect-[3/4] w-56 shrink-0 snap-start rounded-xl md:w-full"
            />
          ))}
        </div>
      </Reveal>
    </>
  );
}
