import type { ReactNode } from 'react';
import PixelGlyph from '@/component/beu/PixelGlyph';
import AccountNav from '@/component/account/AccountNav';

// Same ice band as the product page: it slides up behind the floating header,
// and the texture fades out well before the bottom.
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="beu-pdp-bg relative isolate -mt-[var(--beu-header-h)] min-h-[80vh] overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 [mask-image:linear-gradient(180deg,#000_0%,#000_40%,transparent_90%)]">
        <div className="beu-band-grid absolute inset-0" />
        <div className="beu-band-dots absolute inset-0" />
      </div>
      <PixelGlyph name="cross" size={34} className="absolute right-[6%] top-[calc(var(--beu-header-h)+2rem)] z-[1] hidden text-foreground lg:block" />

      <div className="relative z-[2] mx-auto grid max-w-[1328px] grid-cols-[minmax(0,1fr)] gap-8 px-6 pb-20 pt-[calc(var(--beu-header-h)+2rem)] md:px-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 lg:pb-28">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="mb-4 hidden items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground lg:flex">
            <PixelGlyph name="spark" size={14} className="text-accent" />
            My account
          </p>
          <AccountNav />
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
