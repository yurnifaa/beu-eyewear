import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: ReactNode;
}

// Native <details>: keyboard and screen-reader support for free, no client JS.
export default function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <details key={item.q} className="group py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl py-4 text-left text-sm font-medium marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 md:text-base [&::-webkit-details-marker]:hidden">
            {item.q}
            <span className="beu-chip flex size-8 shrink-0 items-center justify-center transition group-open:rotate-45" aria-hidden="true">
              <Plus size={14} />
            </span>
          </summary>
          <div className="pb-5 pr-12 text-sm leading-relaxed text-foreground/75">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
