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
}

// Native <details>/<summary> instead of a client-managed popover — keyboard-
// and screen-reader-accessible for free, and the option links are real
// navigations (query-param updates), so no client JS is needed at all.
export default function FilterDropdown({ label, activeLabel, options }: FilterDropdownProps) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold text-muted-foreground marker:content-none hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
        {activeLabel ?? label}
        <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 top-full z-20 mt-2 w-52 rounded-xl border border-border bg-background p-2 shadow-lg">
        <ul className="flex flex-col">
          {options.map((option) => (
            <li key={option.href}>
              <Link
                href={option.href}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  option.active ? 'bg-muted font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
