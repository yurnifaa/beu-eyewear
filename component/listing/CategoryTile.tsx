import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductImage from "@/component/ProductImage";

interface CategoryTileProps {
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  index: number;
}

export default function CategoryTile({ slug, name, description, imageUrl, index }: CategoryTileProps) {
  return (
    <Link
      href={`/listing?category=${slug}`}
      className="group relative flex flex-col rounded-3xl border border-border bg-card p-3 transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(40,100,180,0.18)]"
    >
      <span className="absolute left-6 top-6 z-10 rounded-full bg-ink px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
        [ {String(index).padStart(2, "0")} ]
      </span>
      <ProductImage
        imageUrl={imageUrl}
        alt={name}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        objectFit="contain"
        imageClassName="mix-blend-multiply p-4"
        className="aspect-[4/3] w-full rounded-2xl"
      />
      <div className="flex items-end justify-between gap-4 px-3 pb-3 pt-5">
        <div className="min-w-0">
          <p className="font-display text-xl font-black uppercase tracking-[-0.03em]">{name}</p>
          {description && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        <span className="beu-gloss grid size-11 shrink-0 place-items-center rounded-full transition-transform duration-200 group-hover:translate-x-1">
          <ArrowRight size={18} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
