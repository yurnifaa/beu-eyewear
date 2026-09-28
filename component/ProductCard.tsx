import Link from 'next/link';
import PlaceholderImage from '@/component/PlaceholderImage';
import WishlistButton from '@/component/WishlistButton';

export interface ProductCardProps {
  slug: string;
  name: string;
  price: string;
  description: string;
  href: string;
  className?: string;
}

export default function ProductCard({ slug, name, price, description, href, className = '' }: ProductCardProps) {
  return (
    <Link href={href} className={`block w-40 shrink-0 snap-start md:w-full ${className}`}>
      <div className="relative">
        <PlaceholderImage variant="plain" className="aspect-3/4 w-full rounded-xl" />
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
