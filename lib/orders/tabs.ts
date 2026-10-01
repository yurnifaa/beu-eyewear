import type { OrderStatus, PaymentStatus } from '@prisma/client';

// Which Order History tab(s) an order belongs to. Derived from the existing
// status + paymentStatus, so nothing extra is stored.
export type OrderBucket = 'to-pay' | 'to-ship' | 'to-receive' | 'completed' | 'cancelled';
export type OrderTabId = 'all' | Exclude<OrderBucket, 'cancelled'>;

export const BUCKET_LABELS: Record<OrderBucket, string> = {
  'to-pay': 'To Pay',
  'to-ship': 'To Ship',
  'to-receive': 'To Receive',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const ORDER_TABS: { id: OrderTabId; label: string; empty: string }[] = [
  { id: 'all', label: 'All', empty: 'When you place an order, it will show up here.' },
  { id: 'to-pay', label: 'To Pay', empty: 'You have no orders waiting for payment.' },
  { id: 'to-ship', label: 'To Ship', empty: 'You have no paid orders waiting to be shipped.' },
  { id: 'to-receive', label: 'To Receive', empty: 'You have no orders on the way.' },
  { id: 'completed', label: 'Completed', empty: 'You have no completed orders yet.' },
];

// Order matters: a shipped or delivered order is past the payment question, and
// cancelled beats everything. A cancelled order only appears under "All".
export function orderBucket(order: { status: OrderStatus; paymentStatus: PaymentStatus }): OrderBucket {
  if (order.status === 'CANCELLED') return 'cancelled';
  if (order.status === 'DELIVERED') return 'completed';
  if (order.status === 'SHIPPED') return 'to-receive';
  return order.paymentStatus === 'PAID' ? 'to-ship' : 'to-pay';
}

export function inTab(bucket: OrderBucket, tab: OrderTabId): boolean {
  return tab === 'all' || bucket === tab;
}

// Anything unrecognised (typo, stale link, repeated param) falls back to "All".
export function parseTab(value: string | string[] | undefined): OrderTabId {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ORDER_TABS.find((tab) => tab.id === candidate)?.id ?? 'all';
}
