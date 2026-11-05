import type { ReactNode } from 'react';
import PixelGlyph from '@/component/beu/PixelGlyph';

interface SupportHeaderProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
}

export default function SupportHeader({ eyebrow, title, description }: SupportHeaderProps) {
  return (
    <header>
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <PixelGlyph name="spark" size={14} className="text-accent" />
        {eyebrow}
      </p>
      <h1 className="mt-3 text-balance font-display text-4xl font-black uppercase leading-[1] tracking-[-0.04em] md:text-6xl">
        {title}
      </h1>
      {description && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/75 md:text-base">{description}</p>}
    </header>
  );
}
