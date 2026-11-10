// Client-safe helpers for choosing among a product's colors.

// The color shown for items sold in a single option (care kits, sets); it is never offered as a swatch.
export const STANDARD_COLOR = 'Standard';

// The color selected when the page first loads: the first one in stock, else the first one.
// Server and client both use this, so the first render agrees on both sides.
export function initialColor<T extends { color: string; available: number }>(variants: T[]): string | undefined {
  const colored = variants.filter((variant) => variant.color !== STANDARD_COLOR);
  return (colored.find((variant) => variant.available > 0) ?? colored[0])?.color;
}
