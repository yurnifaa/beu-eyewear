"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PixelGlyph from "@/component/beu/PixelGlyph";
import Reveal from "@/component/Reveal";

export interface ShapeOption {
  /** Value used in /listing?shape=… */
  value: string;
  label: string;
  /** Symbol id from GlyphSprite, e.g. "g-round". */
  glyph: string;
}

// Five slots around the active shape: two before, the active one, two after.
// With fewer shapes the strip simply gets shorter.
function slotOffsets(count: number) {
  const before = Math.floor((count - 1) / 2);
  return Array.from({ length: count }, (_, i) => i - before);
}

export default function ShapePicker({ shapes }: { shapes: ShapeOption[] }) {
  const count = Math.min(shapes.length, 5);
  const [active, setActive] = useState(Math.floor(shapes.length / 2));
  if (shapes.length === 0) return null;

  const wrap = (index: number) => (index + shapes.length) % shapes.length;
  const offsets = slotOffsets(count);
  const current = shapes[active];
  const columns = offsets.map((o) => (o === 0 ? "1.6fr" : "1fr")).join(" ");

  return (
    <section aria-labelledby="shape-picker-title" className="bg-ice-mist px-6 py-20 md:px-14 md:py-24">
      <Reveal className="mx-auto max-w-[1328px]">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em]">
          <h2 id="shape-picker-title" className="flex items-center gap-2.5 font-body text-xs font-normal tracking-[0.18em]">
            <PixelGlyph name="spark" size={14} className="text-accent" />
            Shop by frame shape
          </h2>
          <span className="text-muted-foreground">
            [ {String(active + 1).padStart(2, "0")} / {String(shapes.length).padStart(2, "0")} ]
          </span>
        </div>

        <div
          className="mt-12 grid grid-cols-2 items-center gap-6 md:[grid-template-columns:var(--shape-cols)]"
          style={{ "--shape-cols": columns } as CSSProperties}
        >
          {offsets.map((offset) => {
            const index = wrap(active + offset);
            const shape = shapes[index];

            if (offset !== 0) {
              return (
                <button
                  key={shape.value}
                  type="button"
                  aria-label={`Show ${shape.label} frames`}
                  onClick={() => setActive(index)}
                  className="group flex cursor-pointer flex-col items-center gap-5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <svg viewBox="0 0 240 100" aria-hidden="true" className="w-full text-muted-foreground/80 transition-colors group-hover:text-foreground">
                    <use href={`#${shape.glyph}`} />
                  </svg>
                  <span className="font-display text-sm font-medium uppercase tracking-wide md:text-lg">{shape.label}</span>
                </button>
              );
            }

            return (
              <div key={shape.value} className="relative order-first col-span-2 flex flex-col items-center gap-6 pb-2 pt-12 md:order-none md:col-span-1">
                <div aria-hidden="true" className="beu-orb absolute left-1/2 top-[44%] aspect-square w-[min(430px,90%)] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                <PixelGlyph name="spark" size={30} className="absolute left-[6%] top-6 text-white drop-shadow-[0_3px_6px_rgba(40,100,180,0.35)]" />
                <PixelGlyph name="spark" size={20} className="absolute right-[4%] top-28 text-accent" />
                <svg
                  viewBox="0 0 240 100"
                  role="img"
                  aria-label={`${shape.label} frame`}
                  className="relative w-[104%] text-muted-foreground drop-shadow-[0_22px_22px_rgba(30,80,160,0.35)]"
                >
                  <use href={`#${shape.glyph}`} />
                </svg>
                <p className="relative font-display text-3xl font-bold uppercase tracking-[-0.02em] md:text-5xl" aria-live="polite">
                  {current.label}
                </p>
                <div className="relative flex w-full items-center justify-center gap-3">
                  <button
                    type="button"
                    aria-label="Previous shape"
                    onClick={() => setActive(wrap(active - 1))}
                    className="beu-press flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-ink bg-background text-ink transition-transform hover:-translate-y-0.5"
                  >
                    <ArrowLeft size={20} aria-hidden="true" />
                  </button>
                  <Link
                    href={`/listing?shape=${encodeURIComponent(current.value)}`}
                    className="inline-flex min-h-12 min-w-0 items-center justify-center rounded-full bg-ink px-6 py-2 text-center text-xs uppercase leading-snug tracking-[0.14em] text-balance text-white transition-transform hover:-translate-y-0.5"
                  >
                    Shop {current.label} frames
                  </Link>
                  <button
                    type="button"
                    aria-label="Next shape"
                    onClick={() => setActive(wrap(active + 1))}
                    className="beu-press flex size-12 cursor-pointer items-center justify-center rounded-full border-2 border-ink bg-background text-ink transition-transform hover:-translate-y-0.5"
                  >
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
