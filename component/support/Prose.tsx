import type { ReactNode } from 'react';

interface ProseSectionProps {
  title: string;
  index: string;
  children: ReactNode;
}

// One numbered block of policy text. Keeps long legal-ish copy scannable.
export function ProseSection({ title, index, children }: ProseSectionProps) {
  return (
    <section className="border-t border-border py-8 first-of-type:border-t-0 first-of-type:pt-0 last-of-type:pb-0">
      <h2 className="flex items-baseline gap-3 font-display text-lg font-black uppercase tracking-[-0.02em] md:text-xl">
        <span className="text-[11px] font-normal tracking-[0.18em] text-muted-foreground">{index}</span>
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-foreground/80 md:text-[15px]">{children}</div>
    </section>
  );
}

export function ProseList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-none flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="relative pl-5 before:absolute before:left-0 before:top-[0.6em] before:size-1.5 before:rounded-[1px] before:bg-accent">
          {item}
        </li>
      ))}
    </ul>
  );
}
