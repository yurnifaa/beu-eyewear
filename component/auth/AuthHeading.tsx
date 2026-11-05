import type { ElementType, ReactNode } from 'react';
import PixelGlyph, { type GlyphName } from '@/component/beu/PixelGlyph';

interface AuthHeadingProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  glyph?: GlyphName;
  as?: ElementType;
  id?: string;
}

// Top of every auth card: glyph badge, mono eyebrow, display title.
export default function AuthHeading({ eyebrow, title, description, glyph = 'spark', as: Heading = 'h1', id }: AuthHeadingProps) {
  return (
    <div className="text-center">
      <span className="beu-gloss mx-auto flex size-14 items-center justify-center rounded-full text-ink">
        <PixelGlyph name={glyph} size={26} />
      </span>
      <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">[ {eyebrow} ]</p>
      <Heading id={id} className="mt-2 font-display text-2xl font-black uppercase leading-[1.05] tracking-[-0.03em] md:text-3xl">
        {title}
      </Heading>
      {description && <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}
