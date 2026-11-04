import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PixelGlyph from "@/component/beu/PixelGlyph";

interface SubcategoryHeadingProps {
  name: string;
  href: string;
  index: number;
  total: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function SubcategoryHeading({ name, href, index, total }: SubcategoryHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-3">
      <h2 className="flex items-center gap-3 font-display text-xl font-black uppercase tracking-[-0.03em] md:text-3xl">
        <PixelGlyph name="spark" size={18} className="shrink-0 text-accent" />
        {name}
      </h2>
      <div className="flex shrink-0 items-center gap-4 text-[11px] uppercase tracking-[0.18em]">
        <span className="hidden text-muted-foreground sm:inline">
          [ {pad(index)} / {pad(total)} ]
        </span>
        <Link href={href} className="group inline-flex items-center gap-1.5 transition-opacity hover:opacity-70">
          View all
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
