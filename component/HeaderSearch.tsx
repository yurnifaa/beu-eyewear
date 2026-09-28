'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') setOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = inputRef.current?.value.trim() ?? '';
    setOpen(false);
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} className="relative">
      <button aria-label="Search" aria-expanded={open} type="button" onClick={() => setOpen((o) => !o)}>
        <Search size={20} />
      </button>
      {open && (
        <form
          role="search"
          onSubmit={handleSubmit}
          className="absolute right-0 top-full z-20 mt-3 w-[min(90vw,20rem)] rounded-xl border border-border bg-background p-2 shadow-lg"
        >
          <label htmlFor="header-search-input" className="sr-only">
            Search products
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <Search size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              id="header-search-input"
              type="search"
              name="q"
              placeholder="Search frames, lenses, accessories..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </form>
      )}
    </div>
  );
}
