'use client';

import { useWishlistCount } from '@/lib/wishlist';

export default function WishlistBadge() {
  const count = useWishlistCount();

  if (count === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold leading-none text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}
