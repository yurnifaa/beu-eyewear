import Link from 'next/link';
import PixelGlyph from '@/component/beu/PixelGlyph';

export default function EmptyOrders({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-border bg-background/60 px-6 py-16 text-center backdrop-blur">
      <PixelGlyph name="bolt" size={56} className="text-foreground" />
      <h2 className="font-display text-xl font-black uppercase tracking-[-0.03em]">No orders yet</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      <Link
        href="/listing"
        className="mt-2 inline-flex h-12 items-center rounded-full bg-ink px-8 text-xs uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
      >
        Start shopping
      </Link>
    </div>
  );
}
