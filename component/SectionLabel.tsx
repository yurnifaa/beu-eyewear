import type { ReactNode } from 'react';

export default function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  );
}
