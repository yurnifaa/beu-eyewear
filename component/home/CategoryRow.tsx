import Link from "next/link";
import ProductImage from "@/component/ProductImage";
import { RevealItem } from "@/component/Reveal";

export interface CategoryTile {
  slug: string;
  name: string;
  imageUrl?: string;
}

export default function CategoryRow({ categories }: { categories: CategoryTile[] }) {
  return (
    // Below md exactly three tiles fit per row (basis accounts for the two 0.75rem gaps), so five
    // categories wrap 3 + 2 instead of 2 + 2 + 1.
    <div className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-8 md:flex-nowrap md:gap-x-10 lg:gap-x-14">
      {categories.map((category) => (
        <RevealItem key={category.slug} className="basis-[calc((100%-1.5rem)/3)] md:w-32 md:basis-auto">
          <Link href={`/listing?category=${category.slug}`} className="group flex flex-col items-center gap-4">
            <span className="beu-lift relative block">
              <span aria-hidden="true" className="beu-lift-shadow absolute inset-0 rounded-full" />
              <ProductImage
                imageUrl={category.imageUrl}
                alt={category.name}
                sizes="112px"
                imageClassName="beu-zoom"
                className="h-24 w-24 rounded-full ring-4 ring-ice/60 md:h-28 md:w-28"
              />
            </span>
            <span className="text-center font-display text-xs font-bold uppercase tracking-tight wrap-anywhere md:text-sm">
              {category.name.replace(/^BeU\s+/i, "")}
            </span>
          </Link>
        </RevealItem>
      ))}
    </div>
  );
}
