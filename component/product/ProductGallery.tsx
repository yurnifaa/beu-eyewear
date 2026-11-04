'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProductImage from '@/component/ProductImage';

const pad = (n: number) => String(n).padStart(2, '0');

// Big stage + thumbnails. Until real photos are uploaded it shows four
// placeholders and nothing is clickable.
export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const thumbs: (string | undefined)[] = count > 0 ? images : [undefined, undefined, undefined, undefined];
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <div className="flex flex-col gap-4 md:flex-row-reverse md:gap-5">
      <div className="beu-stage relative aspect-[4/5] min-w-0 flex-1 overflow-hidden rounded-3xl">
        <ProductImage
          imageUrl={images[index]}
          alt={alt}
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="h-full w-full !border-0 !bg-transparent"
        />
        {count > 1 && (
          <>
            <span className="beu-chip absolute bottom-4 left-4 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]">
              [ {pad(index + 1)} / {pad(count)} ]
            </span>
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button type="button" aria-label="Previous image" onClick={() => go(index - 1)} className="beu-chip grid size-10 place-items-center">
                <ArrowLeft size={16} />
              </button>
              <button type="button" aria-label="Next image" onClick={() => go(index + 1)} className="beu-chip grid size-10 place-items-center">
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto p-1 md:flex-col md:overflow-visible">
        {thumbs.map((url, i) => (
          <button
            key={i}
            type="button"
            disabled={count === 0}
            aria-label={`Show image ${i + 1}`}
            aria-pressed={count > 0 && i === index}
            onClick={() => setIndex(i)}
            className={`shrink-0 rounded-2xl p-0.5 ring-2 transition ${
              count > 0 && i === index ? 'ring-accent' : 'ring-transparent hover:ring-accent/40'
            } disabled:cursor-default`}
          >
            <ProductImage imageUrl={url} alt="" sizes="72px" className="size-16 rounded-[0.875rem] md:size-[4.5rem]" />
          </button>
        ))}
      </div>
    </div>
  );
}
