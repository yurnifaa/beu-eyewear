import type { ReactNode } from 'react';

// Placeholder pieces for loading.tsx screens. They reserve the same space as the real content (so
// nothing jumps when it arrives) and pulse softly; the pulse stops for reduced motion and in lite mode.

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`beu-skeleton rounded-2xl bg-ice-soft/70 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="w-[56vw] max-w-56 shrink-0 md:w-full md:max-w-none">
      <SkeletonBlock className="aspect-square w-full" />
      <SkeletonBlock className="mt-3 h-3.5 w-3/4" />
      <SkeletonBlock className="mt-2 h-3.5 w-1/3" />
    </div>
  );
}

// A row of cards that scrolls sideways on phones and becomes a grid from md, like ProductRow.
export function ProductRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden md:grid md:grid-cols-4 md:gap-6">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// The ice band that slides up behind the floating header on shop pages, with a title placeholder.
export function BandSkeleton({ children }: { children?: ReactNode }) {
  return (
    <section aria-hidden="true" className="beu-band-bg relative isolate -mt-[var(--beu-header-h)] overflow-hidden">
      <div className="mx-auto max-w-[1328px] px-6 pb-14 pt-[calc(var(--beu-header-h)+1.25rem)] md:px-14 md:pb-20">
        <SkeletonBlock className="h-3 w-40 !rounded-full" />
        <SkeletonBlock className="mx-auto mt-8 h-12 w-3/4 max-w-md md:mt-10 md:h-20" />
        <SkeletonBlock className="mx-auto mt-5 h-3.5 w-2/3 max-w-xl !rounded-full" />
        {children}
      </div>
    </section>
  );
}
