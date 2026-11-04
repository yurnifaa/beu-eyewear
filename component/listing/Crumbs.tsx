import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

// Mono breadcrumb used on the ice bands. The last crumb is the current page and
// truncates, since product names can be long.
export default function Crumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      {crumbs.map((crumb, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-2">
            {last || !crumb.href ? (
              <span
                aria-current={last ? "page" : undefined}
                className={last ? "max-w-[14rem] truncate font-medium text-foreground sm:max-w-sm md:max-w-lg" : undefined}
              >
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="transition-opacity hover:opacity-70">
                {crumb.label}
              </Link>
            )}
            {!last && <span aria-hidden="true">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
