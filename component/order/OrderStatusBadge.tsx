import { BUCKET_LABELS, type OrderBucket } from '@/lib/orders/tabs';

const STYLES: Record<OrderBucket, string> = {
  'to-pay': 'bg-muted text-foreground',
  'to-ship': 'bg-muted text-foreground',
  'to-receive': 'bg-muted text-foreground',
  completed: 'bg-foreground text-background',
  cancelled: 'border border-border text-red-500',
};

export default function OrderStatusBadge({ bucket }: { bucket: OrderBucket }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STYLES[bucket]}`}>
      {BUCKET_LABELS[bucket]}
    </span>
  );
}
