import Link from "next/link";
import ProductImage from "@/component/ProductImage";

export interface CategoryTile {
  slug: string;
  name: string;
  imageUrl?: string;
}

export default function CategoryRow({ categories }: { categories: CategoryTile[] }) {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-8 md:flex-nowrap md:gap-x-10 lg:gap-x-14">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/listing?category=${category.slug}`}
          className="group flex basis-1/3 flex-col items-center gap-4 md:w-32 md:basis-auto"
        >
          <ProductImage
            imageUrl={category.imageUrl}
            alt={category.name}
            sizes="112px"
            className="h-24 w-24 rounded-full ring-4 ring-ice/60 transition group-hover:-translate-y-1 group-hover:ring-ice md:h-28 md:w-28"
          />
          <span className="text-center font-display text-xs font-bold uppercase tracking-tight md:text-sm">
            {category.name.replace(/^BeU\s+/i, "")}
          </span>
        </Link>
      ))}
    </div>
  );
}
