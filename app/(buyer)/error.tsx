'use client'; // Error boundaries must be Client Components

import { buttonClassName } from '@/component/Button';

// Shown when a storefront page can't load, for example if the catalog sheet is
// unreachable. Server-side errors reach the browser as a generic message with a
// digest, so nothing about the data source is exposed here.
export default function StorefrontError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">We&apos;re having trouble loading the shop</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The catalog is temporarily unavailable. Please try again in a moment.
      </p>
      <button type="button" onClick={() => retry()} className={buttonClassName({ variant: 'primary', className: 'uppercase' })}>
        Try again
      </button>
    </div>
  );
}
