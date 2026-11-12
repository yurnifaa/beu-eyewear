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
    // Never navigate or submit, wherever the button is placed (a card, a link, a form).
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
        data-active={isWishlisted}
        className={`beu-chip inline-flex h-14 items-center justify-center gap-2 px-6 text-xs uppercase tracking-[0.14em] ${className}`}
      >
        <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
        {isWishlisted ? 'Added to Favorites' : 'Add to Favorites'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur ${className}`}
    >
      <Heart size={18}className={isWishlisted ? 'fill-current text-foreground' : ''} />
    </button>
  );
}
