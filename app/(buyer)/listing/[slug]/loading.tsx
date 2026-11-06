import { SkeletonBlock } from '@/component/skeleton/Skeleton';

// A product page in outline: photo stage on one side, name, price and buy controls on the other.
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading product…</span>
      <section aria-hidden="true" className="beu-pdp-bg relative isolate -mt-[var(--beu-header-h)] overflow-hidden">
        <div className="mx-auto grid max-w-[1328px] gap-8 px-6 pb-16 pt-[calc(var(--beu-header-h)+1.25rem)] md:grid-cols-2 md:gap-12 md:px-14 md:pb-24">
          <SkeletonBlock className="aspect-[4/5] w-full !rounded-3xl" />
          <div className="flex flex-col gap-5 md:pt-8">
            <SkeletonBlock className="h-3 w-32 !rounded-full" />
            <SkeletonBlock className="h-14 w-4/5 md:h-24" />
            <SkeletonBlock className="h-4 w-1/2 !rounded-full" />
            <SkeletonBlock className="h-12 w-40" />
            <SkeletonBlock className="h-11 w-full max-w-sm !rounded-full" />
            <SkeletonBlock className="h-14 w-full max-w-sm !rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
