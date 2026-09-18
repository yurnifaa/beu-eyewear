'use client';

import { useState, type ReactNode } from 'react';
import { Plus, Minus } from 'lucide-react';

export interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  extra?: ReactNode;
  children: ReactNode;
}

export default function AccordionSection({ title, defaultOpen = false, extra, children }: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span className="text-sm font-semibold">{title}</span>
        <span className="flex items-center gap-3">
          {extra}
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      {open && <div className="mt-3 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
