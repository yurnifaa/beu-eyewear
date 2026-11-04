import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PixelGlyph from "@/component/beu/PixelGlyph";

// Ice-blue hero: giant chrome wordmark behind the real hero photo.
export default function HomeHero() {
  return (
    <section className="beu-hero-bg relative isolate overflow-hidden">
      <div aria-hidden="true" className="beu-hero-grid absolute inset-0" />
      <div aria-hidden="true" className="beu-hero-dots absolute inset-0" />

      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center px-6 pb-10 pt-4 md:px-14 md:pb-14">
        <h1 className="beu-chrome-text pointer-events-none absolute inset-x-0 top-4 z-[1] text-center font-display text-[clamp(7rem,29vw,26rem)] font-black leading-[0.9] tracking-[-0.04em]">
          BeU<span className="sr-only"> Eyewear</span>
        </h1>

        <PixelGlyph name="spark" size={44} className="absolute left-[10%] top-[18%] z-[3] text-white drop-shadow-[0_4px_8px_rgba(40,100,180,0.35)]" />
        <PixelGlyph name="burst" size={36} className="absolute right-[9%] top-[30%] z-[3] text-ink" />
        <PixelGlyph name="cross" size={28} className="absolute left-[7%] top-[62%] z-[3] hidden text-ink md:block" />
        <PixelGlyph name="spark-o" size={40} className="absolute right-[14%] top-[66%] z-[3] hidden text-white md:block" />

        <div className="relative z-[2] w-full pt-[clamp(5.5rem,14vw,12rem)]">
          <Image
            src="/hero-glasses.png"
            alt="Silver BeU eyeglasses with faceted ice-blue lenses"
            width={837}
            height={374}
            priority
            sizes="(max-width: 768px) 92vw, 900px"
            className="mx-auto h-auto w-[min(900px,92vw)] -rotate-3 drop-shadow-[0_30px_30px_rgba(30,80,160,0.35)]"
          />
        </div>

        <div className="relative z-[4] mt-8 grid w-full grid-cols-1 items-center gap-6 text-center md:mt-10 md:grid-cols-[1fr_auto_1fr] md:text-left">
          <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] md:justify-start">
            <PixelGlyph name="spark" size={14} className="text-accent" />
            Drop 01 is live
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/listing"
              className="beu-gloss inline-flex h-12 items-center gap-2 rounded-full px-7 text-xs font-medium uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5"
            >
              Shop the drop
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/search"
              className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-xs uppercase tracking-[0.14em] text-white transition-transform hover:-translate-y-0.5"
            >
              Explore
            </Link>
          </div>
          <p className="font-accent text-2xl md:text-right md:text-3xl">Chrome. Ice blue. Zero apologies.</p>
        </div>
      </div>
    </section>
  );
}
