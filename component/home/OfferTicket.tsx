import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClassName } from "@/component/Button";
import { RevealItem } from "@/component/Reveal";

const STUB_TONES = {
  accent: "bg-accent text-on-accent",
  ink: "bg-ink text-white",
  ice: "bg-ice text-ink",
  chrome: "bg-chrome text-ink",
} as const;

export type OfferTone = keyof typeof STUB_TONES;

// A ticket: coloured stub on the left (the discount / label), details on the right.
export default function OfferTicket({
  stubLabel,
  tone,
  eyebrow,
  title,
  detail,
  href,
  actionLabel,
}: {
  stubLabel: string;
  tone: OfferTone;
  eyebrow: string;
  title: string;
  detail: ReactNode;
  href?: string;
  actionLabel: string;
}) {
  return (
    // The hard shadow is a fixed block behind the ticket; on hover the ticket slides away from
    // it, so the offset grows from 5px to 8px with transform alone.
    <RevealItem className="group relative h-full">
      <span aria-hidden="true" className="absolute inset-0 translate-x-[5px] translate-y-[5px] rounded-2xl bg-ink" />
      <article className="beu-lift relative flex h-full min-h-45 overflow-hidden rounded-2xl border-2 border-ink bg-ice-mist [--lift-x:-3px] [--lift-y:-3px]">
        <div
          className={`relative flex w-14 shrink-0 select-none items-center justify-center after:absolute after:inset-y-3 after:right-0 after:border-r-2 after:border-dashed after:border-current after:opacity-40 after:content-[''] sm:w-16 ${STUB_TONES[tone]}`}
        >
          <span aria-hidden="true" className="absolute -right-2 top-2 h-4 w-4 rounded-full border-2 border-ink bg-background" />
          <span aria-hidden="true" className="absolute -right-2 bottom-2 h-4 w-4 rounded-full border-2 border-ink bg-background" />
          <span className="rotate-180 text-xs font-bold uppercase tracking-widest [writing-mode:vertical-lr]">{stubLabel}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4 pl-6 sm:p-5 sm:pl-7">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-accent">{eyebrow}</p>
            <h3 className="font-display text-base font-bold uppercase leading-snug tracking-tight text-foreground">{title}</h3>
            <div className="mt-1.5 text-sm text-muted-foreground">{detail}</div>
          </div>
          <div className="flex justify-end">
            {href && (
              <Link href={href} className={buttonClassName({ variant: "primary", size: "sm", className: "px-4 py-2" })}>
                {actionLabel}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </article>
    </RevealItem>
  );
}
