import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

export default function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  const chip = "beu-chip grid size-10 place-items-center text-xs";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} aria-label="Previous page" className={chip}>
          <ArrowLeft size={16} />
        </Link>
      )}
      {Array.from({ length: totalPages }).map((_, i) => {
        const n = i + 1;
        const active = n === page;
        return (
          <Link
            key={n}
            href={hrefFor(n)}
            data-active={active}
            aria-current={active ? "page" : undefined}
            aria-label={`Page ${n}`}
            className={chip}
          >
            {n}
          </Link>
        );
      })}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} aria-label="Next page" className={chip}>
          <ArrowRight size={16} />
        </Link>
      )}
    </nav>
  );
}
