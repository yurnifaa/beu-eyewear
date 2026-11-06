import { SkeletonBlock, ProductRowSkeleton } from '@/component/skeleton/Skeleton';

// The home page's first screen in outline: hero wordmark and photo, then the first row of products.
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <section aria-hidden="true" className="beu-hero-bg relative isolate -mt-[var(--beu-header-h)] overflow-hidden">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-6 pb-10 pt-[calc(var(--beu-header-h)+1rem)] md:px-14 md:pb-14">
          <SkeletonBlock className="h-24 w-[min(96vw,36rem)] md:h-36 md:w-[min(72vw,65rem)]" />
          <SkeletonBlock className="mt-10 h-40 w-[min(92vw,900px)] md:h-72" />
          <SkeletonBlock className="mt-8 h-12 w-64 !rounded-full" />
        </div>
      </section>
      <div className="px-6 py-16 md:px-14">
        <div className="mx-auto max-w-[1328px]">
          <ProductRowSkeleton />
        </div>
      </div>
    </div>
  );
}
