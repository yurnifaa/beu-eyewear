'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';

export interface WishlistButtonProps {
  slug: string;
  name: string;
  variant?: 'icon' | 'labeled';
  className?: string;
}

export default function WishlistButton({ slug, name, variant = 'icon', className = '' }: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist(slug);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // ProductCard nests this inside a <Link> — stop the click from also
    // triggering navigation to the product page.
    event.preventDefault();
    event.stopPropagation();
    toggle();
  };

  if (variant === 'labeled') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isWishlisted}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-semibold uppercase text-muted-foreground transition duration-150 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-md ${className}`}
      >
        <Heart size={16} className={isWishlisted ? 'fill-current text-foreground' : ''} />
        {isWishlisted ? 'Favourited' : 'Favourite'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur ${className}`}
    >
      <Heart size={16} className={isWishlisted ? 'fill-current text-foreground' : ''} />
    </button>
  );
}
