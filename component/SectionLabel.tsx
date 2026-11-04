import type { ReactNode } from 'react';
import PixelGlyph from '@/component/beu/PixelGlyph';

// A real <h2> so each section shows up in the page outline. font-body keeps it in DM Mono: the
// theme sets h1/h2 to the display face, and tracking comes from the utility, not the heading base.
export default function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center justify-center gap-2.5 font-body text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      <PixelGlyph name="spark" size={14} className="text-accent" />
      {children}
      <PixelGlyph name="spark" size={14} className="text-accent" />
    </h2>
  );
}
