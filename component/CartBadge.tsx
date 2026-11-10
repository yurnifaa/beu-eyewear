'use client';

import { useCartCount } from '@/lib/cart';

// Sits on the corner of the dark cart button, so it needs a light ring to stay readable.
export default function CartBadge() {
  const count = useCartCount();

  if (count === 0) return null;

  return (
    <span
      aria-hidden="true"
      className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}
