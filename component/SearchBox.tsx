'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import ProductImage from '@/component/ProductImage';
import type { SearchSuggestionDTO } from '@/lib/catalog/dto';
import { formatPrice } from '@/lib/format';
import { SEARCH_QUERY_MAX } from '@/lib/validation/clean-text'; // not text.ts: that one loads Zod

const DEBOUNCE_MS = 200;

export interface SearchBoxProps {
  // 'header' is the compact pill in the site header (desktop); 'page' is the large field on /search.
  variant: 'header' | 'page';
  defaultValue?: string;
}

interface Suggestions {
  query: string;
  items: SearchSuggestionDTO[];
}

// A search field that suggests matching products as the shopper types. It is a plain form first
// (Enter goes to /search?q=), and the dropdown is an addition: nothing is rendered for it until the
// first answer arrives. Requests wait for a short pause in typing and a newer keystroke cancels the
// one in flight, so answers can never land out of order.
export default function SearchBox({ variant, defaultValue = '' }: SearchBoxProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const controllerRef = useRef<AbortController | null>(null);
  const listId = useId();
  const inputId = `${listId}-input`;

  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // Close on a tap or click outside the box.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // Drop any pending or in-flight request when the box goes away.
  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      controllerRef.current?.abort();
    },
    [],
  );

  const requestSuggestions = (text: string) => {
    window.clearTimeout(timerRef.current);
    controllerRef.current?.abort();

    const query = text.trim().slice(0, SEARCH_QUERY_MAX);
    if (query === '') {
      setSuggestions(null);
      setOpen(false);
      setActive(-1);
      return;
    }

    timerRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('search failed');
        const data: { products?: SearchSuggestionDTO[] } = await response.json();
        setSuggestions({ query, items: data.products ?? [] });
        setActive(-1);
        setOpen(true);
      } catch {
        // Superseded by a newer keystroke, or the lookup failed: the dropdown is only a shortcut, and
        // Enter still searches, so stay quiet.
        if (!controller.signal.aborted) setOpen(false);
      }
    }, DEBOUNCE_MS);
  };

  const trimmed = value.trim();
  const searchHref = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
  const items = suggestions?.items ?? [];
  const panelVisible = open && suggestions !== null;
  // Arrow keys walk the products, then the "see all results" row.
  const optionCount = items.length + 1;
  const optionId = (index: number) => `${listId}-option-${index}`;

  const go = (href: string) => {
    window.clearTimeout(timerRef.current);
    controllerRef.current?.abort();
    setOpen(false);
    router.push(href);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    go(searchHref);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (panelVisible) {
        event.preventDefault();
        setOpen(false);
        setActive(-1);
      }
    } else if (event.key === 'Tab') {
      setOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (suggestions === null) return;
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => (current < 0 ? (step === 1 ? 0 : optionCount - 1) : (current + step + optionCount) % optionCount));
    } else if (event.key === 'Enter' && panelVisible && active >= 0) {
      event.preventDefault();
      go(active < items.length ? `/listing/${items[active].slug}` : searchHref);
    }
  };

  const input = (
    <input
      id={inputId}
      type="search"
      name="q"
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        requestSuggestions(event.target.value);
      }}
      onFocus={() => {
        if (suggestions !== null) setOpen(true);
      }}
      onKeyDown={onKeyDown}
      autoComplete="off"
      maxLength={SEARCH_QUERY_MAX}
      role="combobox"
      aria-expanded={panelVisible}
      aria-controls={panelVisible && items.length > 0 ? listId : undefined}
      aria-autocomplete="list"
      aria-activedescendant={panelVisible && active >= 0 ? optionId(active) : undefined}
      placeholder={variant === 'header' ? 'Search frames...' : 'Search frames, lenses, accessories...'}
      className={
        variant === 'header'
          ? 'w-full min-w-0 bg-transparent text-base md:text-sm outline-none placeholder:text-muted-foreground'
          : 'h-full w-full bg-transparent text-base md:text-sm outline-none placeholder:text-muted-foreground'
      }
    />
  );

  return (
    // The panel is a sibling of the form (not inside it) so the form's own blur and ring never clip
    // or restack it; `z-20` keeps it above the page content that follows.
    <div ref={rootRef} className={variant === 'header' ? 'relative hidden md:block' : 'relative z-20 mx-auto max-w-xl'}>
      <form role="search" action="/search" onSubmit={onSubmit}>
        <label htmlFor={inputId} className="sr-only">
          Search products
        </label>
        {variant === 'header' ? (
          <div className="flex h-10 w-52 items-center gap-1 rounded-full border border-border bg-card/70 pl-1 pr-4 transition-colors duration-150 focus-within:border-accent focus-within:bg-background lg:w-56 xl:w-64">
            <button type="submit" aria-label="Search" className="beu-icon-btn size-8 shrink-0 text-muted-foreground hover:text-foreground">
              <Search size={16} strokeWidth={1.75} />
            </button>
            {input}
          </div>
        ) : (
          <div className="beu-bar flex h-14 items-center gap-3 rounded-full pl-5 pr-2 focus-within:ring-2 focus-within:ring-accent/40">
            <Search size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            {input}
            <button
              type="submit"
              className="h-10 shrink-0 rounded-full bg-ink px-5 text-xs uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
            >
              Search
            </button>
          </div>
        )}
      </form>

      <div role="status" aria-live="polite" className="sr-only">
        {panelVisible ? `${items.length} suggestion${items.length === 1 ? '' : 's'}` : ''}
      </div>

      {panelVisible && (
        <div
          className={`absolute top-full z-30 mt-3 rounded-2xl border border-border bg-background p-2.5 shadow-[0_20px_44px_rgba(40,100,180,0.2)] ${
            variant === 'header' ? 'right-0 w-88' : 'right-0 left-0'
          }`}
        >
          {items.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No matches for &ldquo;{suggestions.query}&rdquo;. Try a shorter word.
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Suggested products" className="flex flex-col gap-1">
              {items.map((item, index) => (
                <li
                  key={item.slug}
                  id={optionId(index)}
                  role="option"
                  aria-selected={active === index}
                  onMouseEnter={() => setActive(index)}
                >
                  <Link
                    href={`/listing/${item.slug}`}
                    prefetch={false}
                    tabIndex={-1}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl p-2 transition-colors ${active === index ? 'bg-accent/10' : ''}`}
                  >
                    <ProductImage
                      imageUrl={item.imageUrl}
                      alt=""
                      sizes="48px"
                      objectFit="contain"
                      className="size-12 shrink-0 rounded-lg"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">{item.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {item.outOfStock ? 'Out of stock' : formatPrice(item.price)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              <li
                id={optionId(items.length)}
                role="option"
                aria-selected={active === items.length}
                onMouseEnter={() => setActive(items.length)}
              >
                <Link
                  href={searchHref}
                  prefetch={false}
                  tabIndex={-1}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-10 items-center justify-center rounded-xl px-3 text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors ${
                    active === items.length ? 'bg-accent/10 text-foreground' : ''
                  }`}
                >
                  See all results for &ldquo;{suggestions.query}&rdquo;
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
