import type { ReactNode } from 'react';
import PixelGlyph from '@/component/beu/PixelGlyph';
import SupportNav from '@/component/support/SupportNav';

// Same ice band as the account pages: slides up behind the floating header and
// the texture fades out well before the bottom.
export default function SupportLayout({ children }: { children: ReactNode }) {
  return (
    <div className="beu-pdp-bg relative isolate -mt-[var(--beu-header-h)] min-h-[80vh] overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 [mask-image:linear-gradient(180deg,#000_0%,#000_40%,transparent_90%)]">
        <div className="beu-band-grid absolute inset-0" />
        <div className="beu-band-dots absolute inset-0" />
      </div>
      <PixelGlyph name="cross" size={34} className="absolute right-[6%] top-[calc(var(--beu-header-h)+2rem)] z-[1] hidden text-foreground lg:block" />
      <PixelGlyph name="spark" size={40} className="absolute right-[14%] top-[calc(var(--beu-header-h)+9rem)] z-[1] hidden text-white drop-shadow-[0_4px_8px_rgba(40,100,180,0.35)] lg:block" />

      <div className="relative z-[2] mx-auto max-w-[1328px] px-6 pb-20 pt-[calc(var(--beu-header-h)+2rem)] md:px-14 lg:pb-28">
        <SupportNav />
        <div className="mt-10 flex flex-col gap-10 md:mt-14 md:gap-12">{children}</div>
      </div>
    </div>
  );
}
