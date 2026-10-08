import Image from 'next/image';
import PlaceholderImage, { type PlaceholderImageVariant } from '@/component/PlaceholderImage';

export interface ProductImageProps {
  imageUrl?: string | null;
  alt: string;
  // Sizing/shape classes, e.g. "aspect-3/4 w-full rounded-xl".
  className?: string;
  // What the browser should assume about the rendered width, e.g. "(min-width: 1024px) 25vw, 50vw".
  sizes: string;
  placeholderVariant?: PlaceholderImageVariant;
}

// A product photo when one has been uploaded, otherwise the neutral placeholder.
export default function ProductImage({
  imageUrl,
  alt,
  className = '',
  sizes,
  placeholderVariant = 'plain',
}: ProductImageProps) {
  if (!imageUrl) {
    return <PlaceholderImage variant={placeholderVariant} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden border border-border bg-card ${className}`}>
      <Image src={imageUrl} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
