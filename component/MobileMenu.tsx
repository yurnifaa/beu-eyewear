"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function MobileMenu({ links }: {
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const dialogId = useId();
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialogRef.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-haspopup="dialog"
        className="beu-icon-btn focus-visible:outline-2 focus-visible:outline-offset-2 md:hidden"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        <Menu size={22} strokeWidth={1.75} />
      </button>
      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-foreground backdrop:bg-ink/60"
      >
        <div className="flex h-full w-[min(85vw,20rem)] flex-col overflow-y-auto border-r border-border bg-background p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 id={titleId} className="text-sm font-bold uppercase tracking-[0.14em]">Menu</h2>
            <button
              type="button"
              aria-label="Close navigation menu"
              className="beu-icon-btn focus-visible:outline-2"
              onClick={() => dialogRef.current?.close()}
            >
              <X size={22} strokeWidth={1.75} />
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="mt-4 flex flex-col gap-2">
            {links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => dialogRef.current?.close()}
                  className={`rounded-full px-4 py-3 text-sm uppercase tracking-[0.14em] transition-colors hover:bg-accent/15 focus-visible:outline-2 ${active ? "bg-ink text-white dark:bg-ice dark:text-ink" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </dialog>
    </>
  );
}
