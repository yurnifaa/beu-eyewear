import type { ReactNode } from 'react';
import PixelGlyph from '@/component/beu/PixelGlyph';

export default function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      <PixelGlyph name="spark" size={14} className="text-accent" />
      {children}
      <PixelGlyph name="spark" size={14} className="text-accent" />
    </p>
  );
}
