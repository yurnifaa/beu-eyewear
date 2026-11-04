import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import PixelGlyph from '@/component/beu/PixelGlyph';

interface AccountHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  back?: { href: string; label: string };
  // Actions or a count tag, aligned to the right of the title.
  children?: ReactNode;
}

export default function AccountHeader({ eyebrow, title, description, back, children }: AccountHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="beu-chip mb-5 inline-flex h-9 items-center gap-2 px-4 text-[11px] uppercase tracking-[0.14em]"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <PixelGlyph name="spark" size={14} className="text-accent" />
          {eyebrow}
        </p>
        <h1 className="mt-3 text-balance font-display text-3xl font-black uppercase leading-[1.02] tracking-[-0.03em] md:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/75">{description}</p>}
      </div>
      {children}
    </header>
  );
}
