import Link from "next/link";

interface CategoryChipsProps {
  categories: { slug: string; name: string }[];
  activeSlug?: string;
}

export default function CategoryChips({ categories, activeSlug }: CategoryChipsProps) {
  return (
    <nav aria-label="Collections" className="-my-2 flex gap-2 overflow-x-auto px-1 py-2 md:flex-wrap md:justify-center md:overflow-visible">
      {categories.map((category) => {
        const active = category.slug === activeSlug;
        return (
          <Link
            key={category.slug}
            href={`/listing?category=${category.slug}`}
            data-active={active}
            aria-current={active ? "page" : undefined}
            className="beu-chip inline-flex h-10 shrink-0 items-center px-5 text-xs uppercase tracking-[0.12em]"
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
