import Link from 'next/link';
import { Star } from 'lucide-react';
import ProductImage from '@/component/ProductImage';
import WishlistButton from '@/component/WishlistButton';

export interface ProductCardProps {
  slug?: string;
  name: string;
  price: string;
  description?: string;
  href: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  colorSwatches?: { label: string; color: string }[];
  // Omit when stock isn't known; 0 shows the sold-out badge.
  stockQuantity?: number;
  className?: string;
}

export default function ProductCard({
  slug,
  name,
  price,
  description,
  href,
  imageUrl,
  rating,
  reviewCount,
  colorSwatches,
  stockQuantity,
  className = '',
}: ProductCardProps) {
  const soldOut = stockQuantity !== undefined && stockQuantity <= 0;
  const isFeatured = rating !== undefined;

  return (
    <Link href={href} className={`block w-40 shrink-0 snap-start md:w-full ${className}`}>
      <div className={`relative ${isFeatured ? 'rounded-lg border border-border bg-white p-1' : ''}`}>
        <ProductImage
          imageUrl={imageUrl}
          alt={name}
          sizes="(min-width: 768px) 25vw, 160px"
          objectFit={isFeatured ? 'contain' : 'cover'}
          className={`${isFeatured ? 'aspect-square w-full rounded-md bg-white' : 'aspect-3/4 w-full rounded-xl'} ${soldOut ? 'opacity-60' : ''}`}
        />
        {soldOut && (
          <span className="absolute bottom-2 left-2 rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
            Out of stock
          </span>
        )}
        {slug && <WishlistButton slug={slug} name={name} variant="icon" className="absolute right-2 top-2" />}
      </div>
      {isFeatured ? (
        <div className="relative mt-2 min-h-14 pr-12">
          <div className="flex items-center gap-1 text-[10px] leading-none">
            <Star size={12} className="fill-amber-500 text-amber-500" aria-hidden="true" />
            <span className="font-medium text-amber-700">{rating.toFixed(1)}</span>
            {reviewCount !== undefined && <span className="text-muted-foreground">({reviewCount})</span>}
          </div>
          <p className="mt-1 truncate text-xs font-medium text-foreground">{name}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{price}</p>
          {colorSwatches && colorSwatches.length > 0 && (
            <span className="absolute bottom-0 right-0 flex items-center gap-1" aria-label="Available colors">
              {colorSwatches.map((color) => (
                <span
                  key={color.label}
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
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-bold">{name}</p>
        <p className="text-sm">{price}</p>
      </div>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </>
      )}
    </Link>
  );
}
