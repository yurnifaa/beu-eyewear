import type { ReactNode } from "react";
import PixelGlyph from "@/component/beu/PixelGlyph";
import Crumbs, { type Crumb } from "@/component/listing/Crumbs";

interface ListingHeroProps {
  crumbs: Crumb[];
  title: string;
  description?: string;
  // Small bracketed tag top-right, e.g. "12 pieces".
  meta?: string;
  // Rendered under the description (the category chips).
  children?: ReactNode;
}

// Ice band at the top of every shop page. It slides up behind the floating
// header (same trick as the home hero), and the title shrinks with its length
// so names like "Smart Eyewear" still fit on one line.
export default function ListingHero({ crumbs, title, description, meta, children }: ListingHeroProps) {
  const vw = (84 / (Math.max(title.length, 6) * 0.86)).toFixed(2);

  return (
    <section className="beu-band-bg relative isolate -mt-[var(--beu-header-h)] overflow-hidden">
      <div aria-hidden="true" className="beu-band-grid absolute inset-0" />
      <div aria-hidden="true" className="beu-band-dots absolute inset-0" />

      <PixelGlyph name="spark" size={44} className="absolute left-[7%] top-[38%] z-[1] hidden text-white drop-shadow-[0_4px_8px_rgba(40,100,180,0.35)] md:block" />
      <PixelGlyph name="cross" size={34} className="absolute right-[9%] top-[30%] z-[1] hidden text-foreground md:block" />
      <PixelGlyph name="burst" size={40} className="absolute bottom-[26%] left-[12%] z-[1] hidden text-foreground lg:block" />
      <PixelGlyph name="spark-o" size={40} className="absolute bottom-[30%] right-[11%] z-[1] hidden text-white lg:block" />

      <div className="relative z-[2] mx-auto max-w-[1328px] px-6 pb-14 pt-[calc(var(--beu-header-h)+1.25rem)] md:px-14 md:pb-20">
        <div className="flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <Crumbs crumbs={crumbs} />
          {meta && <span className="shrink-0">[ {meta} ]</span>}
        </div>

        <h1
          className="beu-chrome-text mt-8 break-words text-center font-display font-black uppercase leading-[0.95] tracking-[-0.04em] md:mt-10"
          style={{ fontSize: `clamp(2rem, ${vw}vw, 8.5rem)` }}
        >
          {title}
        </h1>

        {description && (
          <p className="mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed text-foreground/80">{description}</p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
