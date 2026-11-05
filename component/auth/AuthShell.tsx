import type { ReactNode } from 'react';
import PixelGlyph from '@/component/beu/PixelGlyph';

// Full-height ice band (slides behind the floating header) with one frosted
// card in the middle. Used by login, register, forgot/reset password, verify.
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="beu-pdp-bg relative isolate -mt-[var(--beu-header-h)] flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 [mask-image:linear-gradient(180deg,#000_0%,#000_55%,transparent_96%)]">
        <div className="beu-band-grid absolute inset-0" />
        <div className="beu-band-dots absolute inset-0" />
      </div>
      <PixelGlyph name="spark" size={44} className="absolute left-[8%] top-[34%] z-[1] hidden text-white drop-shadow-[0_4px_8px_rgba(40,100,180,0.35)] md:block" />
      <PixelGlyph name="cross" size={34} className="absolute right-[10%] top-[28%] z-[1] hidden text-foreground md:block" />
      <PixelGlyph name="burst" size={40} className="absolute bottom-[16%] left-[14%] z-[1] hidden text-foreground lg:block" />
      <PixelGlyph name="spark-o" size={40} className="absolute bottom-[20%] right-[13%] z-[1] hidden text-white lg:block" />

      <div className="relative z-[2] w-full max-w-md px-4 pb-16 pt-[calc(var(--beu-header-h)+2rem)] sm:px-6">
        <div className="rounded-[2rem] border border-white bg-background/85 p-7 shadow-[0_24px_50px_rgba(40,100,180,0.18)] backdrop-blur sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
