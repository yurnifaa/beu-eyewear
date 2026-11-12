"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Glasses, House, Info, Menu, X, type LucideIcon } from "lucide-react";
import { menuRowClass } from "@/component/menu-row";
import type { NavIcon } from "@/component/nav-links";
import { useScrollLock } from "@/lib/use-scroll-lock";

const ICONS: Record<NavIcon, LucideIcon> = { home: House, shop: Glasses, about: Info };

export default function MobileMenu({ links, accountSlot }: {
  links: { href: string; label: string; icon: NavIcon }[];
  // The Account link (signed in) or Log in button (signed out), shown under the links.
  accountSlot?: ReactNode;
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
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialogRef.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useScrollLock(open);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-haspopup="dialog"
        className="beu-icon-btn focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
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
            {links.map(({ href, label, icon }) => {
              const plain = !href.includes("?") && !href.includes("#");
              const active = plain && (pathname === href || pathname.startsWith(`${href}/`));
              const Icon = ICONS[icon];
              return (
                <Link
                  key={label}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => dialogRef.current?.close()}
                  className={menuRowClass(active)}
                >
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
                  {label}
                </Link>
              );
            })}
            {accountSlot && <div className="mt-2 border-t border-border pt-4">{accountSlot}</div>}
          </nav>
        </div>
      </dialog>
    </>
  );
}
