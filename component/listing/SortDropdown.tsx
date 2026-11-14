'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronLeft } from 'lucide-react';
import type { SortField, SortMenuData } from '@/lib/catalog/sort';
import { useDismissableDetails } from '@/lib/use-dismissable-details';

// Desktop sort control (the phone bar has its own sheet in MobileFilters). Same chip and panel as
// FilterDropdown, but each field (Name, Date, Price) opens a second panel with Ascending and
// Descending. That second panel can't live inside FilterDropdown's panel because that one scrolls
// (overflow clips anything hanging off its edge), and this list is only ever four rows long.
//
// Which field is open is state rather than CSS :hover so that hover, keyboard focus and a tap can
// never leave two second panels showing at once. The options are real links, as in FilterDropdown.
export default function SortDropdown({ menu }: { menu: SortMenuData }) {
  const { ref, close } = useDismissableDetails();
  const [openField, setOpenField] = useState<SortField | null>(null);

  const rowClass = (active: boolean) =>
    `flex min-h-10 w-full items-center justify-between gap-4 rounded-xl px-4 text-xs uppercase tracking-[0.08em] transition-colors ${
      active ? 'bg-accent/15 font-medium text-foreground' : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
    }`;

  return (
    <details
      ref={ref}
      className="group relative"
      // Reopening should start with every field collapsed.
      onToggle={(event) => {
        if (!event.currentTarget.open) setOpenField(null);
      }}
    >
      <summary
        data-active={menu.buttonLabel !== 'Sort'}
        className="beu-chip flex h-10 cursor-pointer list-none items-center gap-1.5 px-4 text-xs uppercase tracking-[0.12em] marker:content-none [&::-webkit-details-marker]:hidden"
      >
        {menu.buttonLabel}
        <ChevronDown size={14} className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="absolute top-full right-0 z-30 mt-3 w-max min-w-56 rounded-2xl border border-border bg-background p-2.5 shadow-[0_20px_44px_rgba(40,100,180,0.2)]">
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href={menu.reset.href}
              onClick={close}
              onFocus={() => setOpenField(null)}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setOpenField(null);
              }}
              aria-current={menu.reset.active ? 'true' : undefined}
              className={rowClass(menu.reset.active)}
            >
              {menu.reset.label}
              {menu.reset.active && <Check size={14} aria-hidden="true" className="shrink-0" />}
            </Link>
          </li>
          {menu.groups.map((group) => {
            const open = openField === group.field;
            const hasActive = group.options.some((option) => option.active);
            return (
              <li
                key={group.field}
                className="relative"
                onFocus={() => setOpenField(group.field)}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') setOpenField(group.field);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === 'mouse') setOpenField((current) => (current === group.field ? null : current));
                }}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenField(group.field)}
                  className={`${rowClass(hasActive)} cursor-pointer`}
                >
                  <span className="flex items-center gap-2">
                    <ChevronLeft size={14} aria-hidden="true" className="shrink-0" />
                    {group.label}
                  </span>
                </button>
                {/* The second panel opens to the left, because this menu sits against the right edge of the
                    page. It is one row (Ascending next to Descending), lined up with its field, so moving the
                    pointer straight across always lands on it: a stacked panel would make "Descending" a
                    diagonal move that leaves the row and closes it. The padding (not a margin) bridges the gap
                    so the pointer never leaves the row on the way. */}
                {open && (
                  <div className="absolute -top-2.5 right-full pr-2">
                    <ul className="flex w-max gap-1 rounded-2xl border border-border bg-background p-2.5 shadow-[0_20px_44px_rgba(40,100,180,0.2)]">
                      {group.options.map((option) => (
                        <li key={option.href}>
                          <Link
                            href={option.href}
                            onClick={close}
                            aria-current={option.active ? 'true' : undefined}
                            className={`${rowClass(option.active)} whitespace-nowrap`}
                          >
                            {option.label}
                            {option.active && <Check size={14} aria-hidden="true" className="shrink-0" />}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
