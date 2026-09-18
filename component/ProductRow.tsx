import type { ReactNode } from 'react';

export interface ProductRowProps {
  children: ReactNode;
  columns?: 3 | 4;
  className?: string;
}

export default function ProductRow({ children, columns = 4, className = '' }: ProductRowProps) {
  const gridCols = columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  return (
    <div
      className={`flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:gap-6 md:overflow-visible ${gridCols} ${className}`}
    >
      {children}
    </div>
  );
}
