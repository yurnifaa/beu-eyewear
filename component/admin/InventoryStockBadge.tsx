// `threshold` is the store's low-stock setting: at or below it (but above zero) is "low".
export default function InventoryStockBadge({ quantity, threshold }: { quantity: number; threshold: number }) {
  if (quantity <= 0) {
    return <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-600">Out of stock</span>;
  }
  if (quantity <= threshold) {
    return <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600">Low · {quantity}</span>;
  }
  return <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">In stock</span>;
}
