import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export interface FilterDropdownOption {
  label: string;
  href: string;
  active?: boolean;
}

export interface FilterDropdownProps {
  label: string;
  activeLabel?: string;
  options: FilterDropdownOption[];
  // Open the panel against the right edge (used for Sort).
  align?: 'left' | 'right';
}

// Native <details>/<summary> instead of a client-managed popover — keyboard-
// and screen-reader-accessible for free, and the option links are real
// navigations (query-param updates), so no client JS is needed at all.
export default function FilterDropdown({ label, activeLabel, options, align = 'left' }: FilterDropdownProps) {
  return (
    <details className="group relative">
      <summary
        data-active={Boolean(activeLabel)}
        className="beu-chip flex h-10 cursor-pointer list-none items-center gap-1.5 px-4 text-xs uppercase tracking-[0.12em] marker:content-none [&::-webkit-details-marker]:hidden"
      >
        {activeLabel ?? label}
        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <div
        className={`absolute top-full z-30 mt-2 w-56 rounded-2xl border border-border bg-background p-2 shadow-[0_20px_44px_rgba(40,100,180,0.2)] ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        <ul className="flex flex-col">
          {options.map((option) => (
            <li key={option.href}>
              <Link
                href={option.href}
                className={`block rounded-xl px-3 py-2 text-xs uppercase tracking-[0.1em] transition-colors ${
                  option.active ? 'bg-accent/15 font-medium text-foreground' : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
                }`}
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
