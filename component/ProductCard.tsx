import Link from 'next/link';
import ProductImage from '@/component/ProductImage';
import WishlistButton from '@/component/WishlistButton';

export interface ProductCardProps {
  slug: string;
  name: string;
  price: string;
  description: string;
  href: string;
  imageUrl?: string;
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
  stockQuantity,
  className = '',
}: ProductCardProps) {
  const soldOut = stockQuantity !== undefined && stockQuantity <= 0;

  return (
    <Link href={href} className={`block w-40 shrink-0 snap-start md:w-full ${className}`}>
      <div className="relative">
        <ProductImage
          imageUrl={imageUrl}
          alt={name}
          sizes="(min-width: 768px) 25vw, 160px"
          className={`aspect-3/4 w-full rounded-xl ${soldOut ? 'opacity-60' : ''}`}
        />
        {soldOut && (
          <span className="absolute bottom-2 left-2 rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background">
            Out of stock
          </span>
        )}
        <WishlistButton slug={slug} name={name} variant="icon" className="absolute right-2 top-2" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-bold">{name}</p>
        <p className="text-sm">{price}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}
