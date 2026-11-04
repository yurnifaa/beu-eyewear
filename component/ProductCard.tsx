import Link from 'next/link';
import { Star } from 'lucide-react';
import ProductImage from '@/component/ProductImage';
import { RevealItem } from '@/component/Reveal';
import WishlistButton from '@/component/WishlistButton';

export interface ProductCardProps {
  slug?: string;
  name: string;
  price: string;
  // Struck-through list price, shown while a discount applies.
  compareAtPrice?: string;
  description?: string;
  href: string;
  imageUrl?: string;
  // Only pass a rating the product has actually earned (reviewCount > 0); an unrated product
  // must not show a score.
  rating?: number;
  reviewCount?: number;
  // The larger "featured" card layout. Defaults to on when a rating is passed, but set it
  // explicitly so an unrated featured product keeps the same layout as its neighbours.
  featured?: boolean;
  colorSwatches?: { label: string; color: string }[];
  // Omit when stock isn't known; 0 shows the sold-out badge.
  stockQuantity?: number;
  className?: string;
}

export default function ProductCard({
  slug,
  name,
  price,
  compareAtPrice,
  description,
  href,
  imageUrl,
  rating,
  reviewCount,
  featured,
  colorSwatches,
  stockQuantity,
  className = '',
}: ProductCardProps) {
  const soldOut = stockQuantity !== undefined && stockQuantity <= 0;
  const isFeatured = featured ?? rating !== undefined;

  return (
    // ~1.5 cards fit on a phone so the next one peeks and the row reads as scrollable. The wishlist
    // button is a sibling of the link (not nested in it) and borrows the lift from the shared group.
    <RevealItem className={`group relative w-[56vw] max-w-56 shrink-0 snap-start md:w-full md:max-w-none ${className}`}>
    <Link href={href} className="block">
      {/* Frame and badges lift together; the shadow layer fades in under them. */}
      <div className="beu-lift relative">
        <span aria-hidden="true" className="beu-lift-shadow absolute inset-0 rounded-2xl" />
        <ProductImage
          imageUrl={imageUrl}
          alt={name}
          sizes="(min-width: 768px) 25vw, 160px"
          objectFit={isFeatured ? 'contain' : 'cover'}
          placeholderVariant="brand"
          imageClassName="beu-zoom"
          className={`${isFeatured ? 'aspect-square w-full rounded-2xl bg-white' : 'aspect-3/4 w-full rounded-2xl'} ${soldOut ? 'opacity-60' : ''}`}
        />
        {soldOut && (
          <span className="absolute bottom-2 left-2 rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
            Out of stock
          </span>
        )}
        {!soldOut && compareAtPrice && (
          <span className="absolute bottom-2 left-2 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-on-accent">
            Sale
          </span>
        )}
      </div>
      {isFeatured ? (
        <div className="relative mt-3 min-h-16 pr-12">
          {/* Always rendered (empty when unrated) so names and prices line up across the row. */}
          <div className="flex min-h-3 items-center gap-1 text-xs leading-none">
            {rating !== undefined && (
              <>
                <Star size={12} className="fill-amber-500 text-amber-500" aria-hidden="true" />
                <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
                {reviewCount !== undefined && <span className="text-muted-foreground">({reviewCount})</span>}
              </>
            )}
          </div>
          {/* min-h-[2lh] reserves two lines so the price lines up across cards with short and long names. */}
          <p className="mt-1.5 line-clamp-2 min-h-[2lh] font-display text-sm font-bold uppercase leading-snug tracking-tight text-foreground">{name}</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {compareAtPrice && <span className="mr-1.5 text-xs font-normal text-muted-foreground line-through">{compareAtPrice}</span>}
            {price}
          </p>
          {colorSwatches && colorSwatches.length > 0 && (
            <span role="group" className="absolute bottom-0 right-0 flex items-center gap-1" aria-label="Available colors">
              {colorSwatches.map((color) => (
                <span
                  key={color.label}
                  role="img"
                  title={color.label}
                  aria-label={color.label}
                  className="size-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: color.color }}
                />
              ))}
            </span>
          )}
        </div>
      ) : (
        <>
      <div className="mt-3 flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-3">
        <p className="line-clamp-2 font-display text-xs font-bold uppercase leading-snug tracking-tight md:text-sm">{name}</p>
        <p className="text-xs font-medium md:shrink-0 md:text-sm">
          {compareAtPrice && <span className="mr-1.5 text-xs text-muted-foreground line-through">{compareAtPrice}</span>}
          {price}
        </p>
      </div>
      {description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>}
        </>
      )}
    </Link>
    {slug && <WishlistButton slug={slug} name={name} variant="icon" className="beu-lift absolute right-1.5 top-1.5" />}
    </RevealItem>
  );
}
