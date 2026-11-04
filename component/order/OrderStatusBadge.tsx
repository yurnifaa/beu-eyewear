import { BUCKET_LABELS, type OrderBucket } from '@/lib/orders/tabs';

const STYLES: Record<OrderBucket, string> = {
  'to-pay': 'bg-amber-500/15 text-amber-800',
  'to-ship': 'bg-accent/15 text-foreground',
  'to-receive': 'bg-accent/15 text-foreground',
  completed: 'bg-ink text-white',
  cancelled: 'border border-red-500/40 bg-red-500/10 text-red-700',
};

export default function OrderStatusBadge({ bucket }: { bucket: OrderBucket }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.16em] ${STYLES[bucket]}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {BUCKET_LABELS[bucket]}
    </span>
  );
}
