'use client';

import { useWishlistCount } from '@/lib/wishlist';

export default function WishlistCount() {
  const count = useWishlistCount();
  return <>{count} saved</>;
}
