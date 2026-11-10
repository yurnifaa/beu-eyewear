// The "fly to cart" animation: a small "+N" chip arcs from the Add to Cart button to the header cart
// icon, then tells the icon (via CART_LANDED_EVENT) to bump. Plain DOM + Web Animations API, so it
// works from any component with no provider and no re-renders. Only transform and opacity move.

export const CART_TARGET_ATTR = 'data-cart-target';
export const CART_LANDED_EVENT = 'beu:cart-landed';

const DURATION_MS = 600;
const SAMPLES = 12;
// Worst case before giving up on the animation (background tabs throttle animations).
const SAFETY_MS = DURATION_MS + 300;

// Reduced motion and "lite" mode (Save-Data / 2G / 3G, set by ConnectionMode) skip the flight.
export function shouldReduceMotion() {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  return document.documentElement.hasAttribute('data-lite');
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function center(rect: DOMRect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function run(from: HTMLElement, label: string): Promise<void> {
  const target = document.querySelector<HTMLElement>(`[${CART_TARGET_ATTR}]`);
  if (!target || typeof Element.prototype.animate !== 'function') return Promise.resolve();

  const start = center(from.getBoundingClientRect());
  const end = center(target.getBoundingClientRect());
  // The control point sits above the straight line, so the chip rises and then drops into the cart.
  const control = {
    x: (start.x + end.x) / 2,
    y: Math.min(start.y, end.y) - Math.max(60, Math.abs(start.x - end.x) * 0.25),
  };

  const chip = document.createElement('div');
  chip.setAttribute('aria-hidden', 'true');
  chip.textContent = label;
  Object.assign(chip.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    zIndex: '60',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '28px',
    minWidth: '28px',
    padding: '0 10px',
    borderRadius: '9999px',
    background: 'var(--ink, #111a33)',
    color: '#fff',
    font: '700 12px/1 system-ui, sans-serif',
    boxShadow: '0 6px 16px rgba(10, 26, 47, 0.3)',
    willChange: 'transform, opacity',
  });
  document.body.appendChild(chip);

  // Position by the chip's centre: translate to the point, then pull back by half its own size.
  const half = { w: chip.offsetWidth / 2, h: chip.offsetHeight / 2 };
  const keyframes: Keyframe[] = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const raw = i / SAMPLES;
    const t = easeInOut(raw);
    const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
    const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
    // Grows slightly early in the flight, then shrinks into the icon.
    const scale = raw < 0.3 ? 1 + (raw / 0.3) * 0.15 : 1.15 - ((raw - 0.3) / 0.7) * 0.6;
    keyframes.push({
      transform: `translate(${x - half.w}px, ${y - half.h}px) scale(${scale})`,
      opacity: raw > 0.85 ? 1 - ((raw - 0.85) / 0.15) * 0.1 : 1,
      offset: raw,
    });
  }

  const animation = chip.animate(keyframes, { duration: DURATION_MS, easing: 'linear', fill: 'forwards' });
  const finished = animation.finished.then(
    () => undefined,
    () => undefined,
  );
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, SAFETY_MS));

  return Promise.race([finished, timeout]).finally(() => {
    animation.cancel();
    chip.remove();
  });
}

// Resolves when the chip has landed (or straight away if there is nothing to animate). Never rejects.
export async function flyToCart({ from, label }: { from: HTMLElement; label: string }): Promise<void> {
  if (shouldReduceMotion()) return;
  try {
    await run(from, label);
  } catch {
    // The animation is decoration; the add must still go through.
    return;
  }
  window.dispatchEvent(new Event(CART_LANDED_EVENT));
}
