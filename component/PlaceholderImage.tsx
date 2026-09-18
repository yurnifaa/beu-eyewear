export type PlaceholderImageVariant = 'cross' | 'plain';

export interface PlaceholderImageProps {
  variant?: PlaceholderImageVariant;
  className?: string;
}

export default function PlaceholderImage({
  variant = 'plain',
  className = '',
}: PlaceholderImageProps) {
  return (
    <div className={`relative overflow-hidden border border-gray-300 bg-gray-200 ${className}`}>
      {variant === 'cross' && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-gray-400"
        >
          <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </div>
  );
}
