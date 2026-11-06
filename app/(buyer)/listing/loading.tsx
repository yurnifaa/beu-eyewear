import { BandSkeleton, ProductCardSkeleton, SkeletonBlock } from '@/component/skeleton/Skeleton';

// Covers /listing and /listing/<slug>'s parent: a shop band, the filter bar and a grid of cards.
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading products…</span>
      <BandSkeleton />
      <div className="relative z-10 -mt-7 px-6 md:px-14">
        <SkeletonBlock className="mx-auto h-[4.5rem] max-w-[1328px] !rounded-[1.75rem] md:h-16 md:!rounded-full" />
      </div>
      <div className="px-6 py-12 md:px-14 md:py-16">
        <div className="mx-auto grid max-w-[1328px] grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
