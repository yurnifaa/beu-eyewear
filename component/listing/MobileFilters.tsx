'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpDown, Check, SlidersHorizontal, X } from 'lucide-react';
import type { FilterDropdownOption } from '@/component/FilterDropdown';
import type { FilterOption } from '@/lib/catalog/types';

export type FacetKey = 'lens' | 'material' | 'shape' | 'color';

export interface MobileFilterGroup {
  key: FacetKey;
  title: string;
  options: FilterOption[];
  active?: string;
}

export interface MobileFilterChip {
  label: string;
  aria: string;
  href: string;
}

interface MobileFiltersProps {
  groups: MobileFilterGroup[];
  // Params that must survive applying filters: category, sub, sort.
  baseParams: Record<string, string>;
  sortOptions: FilterDropdownOption[];
  sortLabel: string;
  chips: MobileFilterChip[];
  clearHref: string;
}

type Sheet = 'filters' | 'sort' | null;
type Draft = Partial<Record<FacetKey, string>>;

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

// Phone-only filter bar: one 48px row (Filters + Sort) instead of five wrapping chips. Filters opens
// a bottom sheet where choices are drafted and applied together; Sort is instant. The chips and the
// sort rows are real links with server-built hrefs, so only "Show results" builds a URL here.
export default function MobileFilters({ groups, baseParams, sortOptions, sortLabel, chips, clearHref }: MobileFiltersProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draft, setDraft] = useState<Draft>({});

  const activeCount = groups.filter((group) => group.active).length;

  // Sync the native <dialog> with `sheet`. Esc, focus trap and focus return come with showModal().
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (sheet && !dialog.open) dialog.showModal();
    if (!sheet && dialog.open) dialog.close();
  }, [sheet]);

  // Lock page scroll while a sheet is open.
  useEffect(() => {
    if (!sheet) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheet]);

  const openFilters = () => {
    setDraft(Object.fromEntries(groups.map((group) => [group.key, group.active])));
    setSheet('filters');
  };

  const toggle = (key: FacetKey, value: string) =>
    setDraft((current) => ({ ...current, [key]: current[key] === value ? undefined : value }));

  const apply = () => {
    const params = new URLSearchParams(baseParams);
    for (const group of groups) {
      const value = draft[group.key];
      if (value) params.set(group.key, value);
    }
    setSheet(null);
    router.push(`/listing?${params.toString()}`);
  };

  const close = () => setSheet(null);

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={openFilters}
          data-active={activeCount > 0}
          className={`beu-chip flex h-12 min-w-0 flex-1 items-center justify-center gap-2 px-4 text-xs font-medium uppercase tracking-[0.12em] ${focusRing}`}
        >
          <SlidersHorizontal size={18} aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-medium tracking-normal text-ink">
              {activeCount}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setSheet('sort')}
          className={`beu-chip flex h-12 shrink-0 items-center justify-center gap-2 px-[18px] text-xs font-medium uppercase tracking-[0.12em] ${focusRing}`}
        >
          <ArrowUpDown size={18} aria-hidden="true" />
          {sortLabel}
        </button>
      </div>

      {chips.length > 0 && (
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chips.map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              aria-label={chip.aria}
              className={`flex h-11 shrink-0 items-center gap-2 rounded-full border border-ice bg-ice-mist pl-4 pr-3 text-xs whitespace-nowrap active:bg-ice-soft ${focusRing}`}
            >
              {chip.label}
              <X size={16} aria-hidden="true" />
            </Link>
          ))}
          <Link
            href={clearHref}
            className={`flex h-11 shrink-0 items-center px-3 text-xs font-medium uppercase tracking-[0.08em] text-accent underline underline-offset-4 ${focusRing}`}
          >
            Clear all
          </Link>
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          // Clicks on the backdrop target the <dialog> itself.
          if (event.target === event.currentTarget) close();
        }}
        aria-label={sheet === 'sort' ? 'Sort' : 'Filters'}
        className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[85dvh] w-full max-w-none flex-col rounded-b-none rounded-t-[1.75rem] border-0 bg-background p-0 text-foreground shadow-[0_-20px_50px_rgba(10,26,47,0.25)] backdrop:bg-ink/55 open:flex"
      >
        {sheet && (
          <>
            <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border" />
            <div className="flex shrink-0 items-center justify-between py-1 pl-5 pr-2">
              <h2 className="font-display text-[15px] font-semibold uppercase tracking-[-0.01em]">
                {sheet === 'sort' ? 'Sort' : 'Filters'}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label={sheet === 'sort' ? 'Close sort' : 'Close filters'}
                className={`grid size-12 place-items-center rounded-full ${focusRing}`}
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            {sheet === 'filters' && (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
                  {groups.map((group) => (
                    <section key={group.key} className="border-t border-border/60 pb-[18px] pt-3.5">
                      <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{group.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => {
                          const selected = draft[group.key] === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => toggle(group.key, option.value)}
                              className={`flex h-11 items-center gap-1.5 rounded-full border px-4 text-[13px] ${focusRing} ${
                                selected ? 'border-ink bg-ink text-white' : 'border-border bg-background text-foreground active:bg-ice-soft'
                              }`}
                            >
                              {option.hex && (
                                <span aria-hidden="true" className="size-3.5 rounded-full border border-black/15" style={{ background: option.hex }} />
                              )}
                              {option.label}
                              {selected && <Check size={14} strokeWidth={2.5} aria-hidden="true" />}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
                <div className="flex shrink-0 items-center gap-2 border-t border-border bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                  <button
                    type="button"
                    onClick={() => setDraft({})}
                    className={`h-[52px] shrink-0 px-4 text-xs font-medium uppercase tracking-[0.1em] underline underline-offset-4 ${focusRing}`}
                  >
                    Clear all
                  </button>
                  <button
                    type="button"
                    onClick={apply}
                    className={`h-[52px] flex-1 rounded-full bg-ink text-xs font-medium uppercase tracking-[0.14em] text-white ${focusRing}`}
                  >
                    Show results
                  </button>
                </div>
              </>
            )}

            {sheet === 'sort' && (
              <ul className="px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {sortOptions.map((option) => (
                  <li key={option.href}>
                    <Link
                      href={option.href}
                      onClick={close}
                      aria-current={option.active ? 'true' : undefined}
                      className={`flex min-h-14 items-center justify-between rounded-2xl px-3 text-[13px] uppercase tracking-[0.06em] ${focusRing} ${
                        option.active ? 'bg-ice-mist' : 'active:bg-ice-soft'
                      }`}
                    >
                      {option.label}
                      {option.active && <Check size={18} strokeWidth={2.5} aria-hidden="true" />}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </dialog>
    </>
  );
}
