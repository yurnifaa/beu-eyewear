'use client';

import { useId, useState, type ReactNode } from 'react';
import { Plus, Minus } from 'lucide-react';

export interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  extra?: ReactNode;
  children: ReactNode;
}

export default function AccordionSection({ title, defaultOpen = false, extra, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border-b border-border py-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="font-display text-xs font-black uppercase tracking-[0.02em] md:text-sm">{title}</span>
        <span className="flex items-center gap-3">
          {extra}
          <span className="beu-chip grid size-8 place-items-center transition-transform group-hover:scale-105">
            {open ? <Minus size={14} /> : <Plus size={14} />}
          </span>
        </span>
      </button>
      {open && (
        <div id={panelId} className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}
