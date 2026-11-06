import { SkeletonBlock } from '@/component/skeleton/Skeleton';

// The cart in outline: the title, then a couple of item rows beside the summary card.
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading your cart…</span>
      <section aria-hidden="true" className="beu-pdp-bg relative isolate -mt-[var(--beu-header-h)] overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-[calc(var(--beu-header-h)+1.5rem)] sm:px-8">
          <SkeletonBlock className="h-14 w-64 md:h-24 md:w-[28rem]" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
            <div className="flex flex-col gap-4">
              <SkeletonBlock className="h-24 w-full" />
              <SkeletonBlock className="h-24 w-full" />
            </div>
            <SkeletonBlock className="hidden h-64 w-full lg:block" />
          </div>
        </div>
      </section>
    </div>
  );
}
