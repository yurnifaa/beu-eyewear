import { ShoppingCart } from 'lucide-react';

// The centered "Added to Cart" confirmation shown after an add (AddToCartSection). Visual only: it is
// hidden from screen readers (AddToCartSection announces the add itself) and ignores the pointer, so
// it never blocks a tap on the page underneath. The fade in, hold and fade out are one CSS animation
// (.beu-pop in globals.css) running for `durationMs`, so it costs nothing once it has mounted.
// The backdrop blur keeps page text behind the box from fighting with the white label; phones and
// "lite" mode drop it (globals.css) and keep the plain 60% dark fill.
export default function AddedToCartPopup({ durationMs }: { durationMs: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-70 grid place-items-center p-6">
      <div
        className="beu-pop flex flex-col items-center gap-3 rounded-3xl bg-black/60 px-10 backdrop-blur-md py-8 text-white shadow-[0_20px_50px_rgba(10,26,47,0.3)]"
        style={{ animationDuration: `${durationMs}ms` }}
      >
        <ShoppingCart size={36} strokeWidth={1.75} />
        <span className="text-base font-medium tracking-[0.02em]">Added to Cart</span>
      </div>
    </div>
  );
}
