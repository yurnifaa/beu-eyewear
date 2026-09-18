import Link from 'next/link';
import { Heart } from 'lucide-react';
import PlaceholderImage from '@/component/PlaceholderImage';

export interface ProductCardProps {
  name: string;
  price: string;
  description: string;
  href: string;
  className?: string;
}

export default function ProductCard({ name, price, description, href, className = '' }: ProductCardProps) {
  return (
    <Link href={href} className={`block w-40 shrink-0 snap-start md:w-full ${className}`}>
      <div className="relative">
        <PlaceholderImage variant="plain" className="aspect-[3/4] w-full rounded-xl" />
        {/* Inert for now — a real implementation would stopPropagation/preventDefault here */}
        <button
          aria-label="Add to wishlist"
          type="button"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur"
        >
          <Heart size={16} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-bold">{name}</p>
        <p className="text-sm">{price}</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}
