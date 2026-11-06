import { BandSkeleton, ProductRowSkeleton } from '@/component/skeleton/Skeleton';

// Shown the instant a link is clicked, while the next page's data loads. Any page without its own
// loading.tsx falls back to this one.
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <BandSkeleton />
      <div className="px-6 py-12 md:px-14 md:py-16">
        <div className="mx-auto max-w-[1328px]">
          <ProductRowSkeleton />
        </div>
      </div>
    </div>
  );
}
