'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';

export interface FilterDropdownOption {
  label: string;
  href: string;
  active?: boolean;
}

export interface FilterDropdownProps {
  label: string;
  activeLabel?: string;
  options: FilterDropdownOption[];
  // Open the panel against the right edge (used for Sort). Desktop only: on phones every panel
  // opens full-width under the filter bar.
  align?: 'left' | 'right';
}

// Native <details>/<summary> so it is keyboard- and screen-reader-accessible and works before
// hydration; the option links are real navigations (query-param updates). The small effect below
// only adds what <details> lacks: closing on outside tap, Escape, and after picking an option.
// Because tapping another chip counts as "outside", only one panel is ever open at a time.
export default function FilterDropdown({ label, activeLabel, options, align = 'left' }: FilterDropdownProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = () => {
      if (detailsRef.current) detailsRef.current.open = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const details = detailsRef.current;
      if (event.key === 'Escape' && details?.open) {
        close();
        details.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    // Phones: the details is static, so the panel anchors to the (relative) filter bar and opens
    // full-width beneath it. md and up: the panel hangs off its own chip.
    <details ref={detailsRef} className="group md:relative">
      <summary
        data-active={Boolean(activeLabel)}
        className="beu-chip flex h-10 cursor-pointer list-none items-center gap-1.5 px-4 text-xs uppercase tracking-[0.12em] marker:content-none [&::-webkit-details-marker]:hidden"
      >
        {activeLabel ?? label}
        <ChevronDown size={14} className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div
        className={`absolute top-full right-0 left-0 z-30 mt-3 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-background p-2.5 shadow-[0_20px_44px_rgba(40,100,180,0.2)] md:w-max md:min-w-56 md:max-w-80 ${
          align === 'right' ? 'md:left-auto md:right-0' : 'md:left-0 md:right-auto'
        }`}
      >
        <ul className="flex flex-col gap-1">
          {options.map((option) => (
            <li key={option.href}>
              <Link
                href={option.href}
                onClick={() => {
                  if (detailsRef.current) detailsRef.current.open = false;
                }}
                aria-current={option.active ? 'true' : undefined}
                className={`flex min-h-12 items-center justify-between gap-4 rounded-xl px-4 text-[13px] uppercase tracking-[0.08em] transition-colors md:min-h-10 md:text-xs ${
                  option.active ? 'bg-accent/15 font-medium text-foreground' : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground active:bg-accent/15'
                }`}
              >
                {option.label}
                {option.active && <Check size={14} aria-hidden="true" className="shrink-0" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
