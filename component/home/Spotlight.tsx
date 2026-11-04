import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PixelGlyph from "@/component/beu/PixelGlyph";
import Reveal, { ParallaxImage } from "@/component/Reveal";
import type { CatalogProduct } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";

// "Chrome Shield" -> two heavy lines, the second pushed to the right.
function splitName(name: string): [string, string] {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return [name, ""];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
}

const LEFT_WORDS = ["Reflective", "Chrome", "Be seen", "Frame"];
const RIGHT_WORDS = ["Post-Y2K", "Ice-blue", "No. 01", "Glare"];

// One frame, shown huge: the real product photo over ghost type.
export default function Spotlight({ product }: { product: CatalogProduct }) {
  const [lineOne, lineTwo] = splitName(product.name);
  const specs = [
    product.frameMaterial,
    product.lensOption,
    product.dimensions?.weightG ? `${product.dimensions.weightG} g` : undefined,
  ].filter(Boolean);

  return (
    <section aria-labelledby="spotlight-title" className="beu-spot-bg relative overflow-hidden px-6 py-20 md:px-14 md:py-24">
      <div aria-hidden="true" className="beu-spot-dots absolute inset-0" />
      {[
        { words: LEFT_WORDS, side: "left-4 rotate-180" },
        { words: RIGHT_WORDS, side: "right-4" },
      ].map(({ words, side }) => (
        <div
          key={side}
          aria-hidden="true"
          className={`absolute bottom-10 top-10 hidden items-center justify-between text-[11px] uppercase tracking-[0.5em] text-ink/50 [writing-mode:vertical-rl] xl:flex ${side}`}
        >
          {words.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      ))}

      <div className="relative mx-auto max-w-[1328px]">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em]">
          <span className="flex items-center gap-2.5">
            <PixelGlyph name="spark" size={16} className="text-ink" />
            Spotlight — frame no. 01
          </span>
          <span className="hidden text-ink/60 sm:inline">[ {product.reviewCount > 0 && product.rating ? `${product.rating.toFixed(1)} ★` : "new"} ]</span>
        </div>

        <div className="relative mt-8">
          {/* Reveal only wraps siblings of the photo, never an ancestor: a transform above the
              image would break its multiply blend. */}
          <Reveal>
            <h2
              id="spotlight-title"
              className="relative flex flex-col font-display text-[clamp(2.75rem,11vw,10.5rem)] font-black uppercase leading-[0.9] tracking-[-0.07em] text-ink"
            >
              <span>{lineOne}</span>
              {lineTwo && <span className="self-end">{lineTwo}</span>}
            </h2>
          </Reveal>

          <PixelGlyph name="ball" size={96} className="absolute right-0 top-1 z-[2] hidden text-ink md:block" />
          <PixelGlyph name="cross" size={60} className="absolute left-0 top-[55%] z-[2] hidden text-ink md:block" />
          <PixelGlyph name="spark-o" size={80} className="absolute right-[3%] top-[62%] z-[2] hidden text-ink md:block" />

          {/* No z-index or transform on this wrapper: that would isolate the image's multiply blend
              from the grey background, leaving a white tile around product photos shot on white. */}
          <div className="relative mx-auto -mt-[min(9vw,6rem)] aspect-[3/2] w-[min(760px,92%)] sm:aspect-[2/1]">
            <div aria-hidden="true" className="absolute bottom-[24%] left-1/2 h-8 w-3/5 -translate-x-1/2 rounded-full bg-ink/30 blur-2xl" />
            {product.imageUrl ? (
              <ParallaxImage
                range={[-20, 20]}
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 760px, 92vw"
                className="-rotate-[8deg] object-contain mix-blend-multiply"
              />
            ) : (
              <svg viewBox="0 0 240 100" role="img" aria-label={product.name} className="size-full -rotate-[8deg] text-chrome drop-shadow-[0_30px_28px_rgba(20,40,80,0.45)]">
                <use href="#g-shield" />
              </svg>
            )}
          </div>

          <Reveal className="relative z-[4] mt-10 flex flex-wrap items-end justify-between gap-8">
            <div className="max-w-[430px]">
              <span className="inline-block bg-ink px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
                Frame overview
              </span>
              <p className="mt-3.5 font-display text-2xl font-bold uppercase tracking-[-0.03em]">
                {product.compareAtPrice && (
                  <span className="mr-2 text-base font-normal text-ink/50 line-through">{formatPrice(product.compareAtPrice)}</span>
                )}
                {formatPrice(product.price)}
              </p>
              {product.shortDescription && (
                <p className="mt-3 text-xs leading-relaxed text-ink/80">{product.shortDescription}</p>
              )}
              {specs.length > 0 && (
                <p className="mt-2 text-xs uppercase tracking-[0.1em] text-ink/60">{specs.join(" · ")}</p>
              )}
            </div>
            <Link href={`/listing/${product.slug}`} className="group flex items-center gap-4 text-ink">
              <span className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-black uppercase leading-none tracking-[-0.05em] transition-transform group-hover:translate-x-1">
                Shop frame
              </span>
              <ArrowUpRight size={48} strokeWidth={2.6} aria-hidden="true" className="shrink-0" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
