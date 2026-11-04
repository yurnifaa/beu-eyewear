import PixelGlyph from '@/component/beu/PixelGlyph';

// 'brand' is the storefront's stand-in for a missing product photo: the ice surface with one
// spark glyph, instead of an empty box.
export type PlaceholderImageVariant = 'cross' | 'plain' | 'brand';

export interface PlaceholderImageProps {
  variant?: PlaceholderImageVariant;
  className?: string;
}

export default function PlaceholderImage({
  variant = 'plain',
  className = '',
}: PlaceholderImageProps) {
  return (
    <div className={`relative overflow-hidden border border-border bg-card ${className}`}>
      {variant === 'cross' && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-muted-foreground/50"
        >
          <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {variant === 'brand' && (
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <PixelGlyph name="spark" size={32} className="text-ice" />
        </div>
      )}
    </div>
  );
}
