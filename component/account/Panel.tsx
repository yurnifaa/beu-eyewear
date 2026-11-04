import type { ReactNode } from 'react';
import PixelGlyph from '@/component/beu/PixelGlyph';

interface PanelProps {
  title?: string;
  // Small bracketed tag, e.g. "01".
  index?: string;
  id?: string;
  className?: string;
  children: ReactNode;
}

// Frosted card used for every block on the account pages.
export default function Panel({ title, index, id, className = '', children }: PanelProps) {
  const headingId = title && id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`rounded-3xl border border-border bg-background/80 p-6 shadow-[0_18px_40px_rgba(40,100,180,0.1)] backdrop-blur md:p-8 ${className}`}
    >
      {title && (
        <header className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
          <h2 id={headingId} className="flex items-center gap-2.5 font-display text-sm font-black uppercase tracking-[0.01em] md:text-base">
            <PixelGlyph name="spark" size={16} className="shrink-0 text-accent" />
            {title}
          </h2>
          {index && <span className="text-[11px] tracking-[0.18em] text-muted-foreground">[ {index} ]</span>}
        </header>
      )}
      {children}
    </section>
  );
}
