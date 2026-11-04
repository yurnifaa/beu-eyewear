import 'server-only';

import type { Prisma } from '@prisma/client';
import { returnOrderItemsToStock } from '@/lib/catalog/stock';
import { formatOrderNumber } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import {
  CANCELLABLE_STATUSES,
  STATUS_LABELS,
  canCancel,
  canMarkPaid,
  cancelBlockedReason,
  nextStatus,
} from './rules';

export type TransitionResult = { ok: true; message: string } | { ok: false; error: string };

const NOT_FOUND = { ok: false, error: 'Order not found.' } as const;
const CHANGED = { ok: false, error: 'This order was just changed. Refresh the page and try again.' } as const;

// Every change is a conditional updateMany: the WHERE clause re-checks the rule
// at write time, so two clicks or two tabs can't both win. That guard is also
// what makes cancel return stock exactly once.

export async function advanceOrder(id: string): Promise<TransitionResult> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, select: { status: true } });
    if (!order) return NOT_FOUND;

    const next = nextStatus(order.status);
    if (!next) return { ok: false, error: `A ${STATUS_LABELS[order.status].toLowerCase()} order can't move forward.` };

    const now = new Date();
    const data: Prisma.OrderUpdateManyMutationInput = { status: next };
    if (next === 'SHIPPED') data.shippedAt = now;
    if (next === 'DELIVERED') data.deliveredAt = now;

    const { count } = await tx.order.updateMany({ where: { id, status: order.status }, data });
    if (count === 0) return CHANGED;
    return { ok: true, message: `Order marked ${STATUS_LABELS[next].toLowerCase()}.` };
  });
}

// No payment provider yet, so the admin records payment by hand.
export async function markOrderPaid(id: string): Promise<TransitionResult> {
  const { count } = await prisma.order.updateMany({
    where: { id, paymentStatus: 'UNPAID', status: { not: 'CANCELLED' } },
    data: { paymentStatus: 'PAID', paidAt: new Date() },
  });
  if (count === 1) return { ok: true, message: 'Order marked as paid.' };

  const order = await prisma.order.findUnique({ where: { id }, select: { status: true, paymentStatus: true } });
  if (!order) return NOT_FOUND;
  if (order.paymentStatus === 'PAID') return { ok: false, error: 'This order is already paid.' };
  if (!canMarkPaid(order)) return { ok: false, error: "A cancelled order can't be marked as paid." };
  return CHANGED;
}

// userId scopes the cancel to its owner for the customer-side action; the admin
// action leaves it out. The units go back into stock (with a RETURN movement) in the
// same transaction as the status change, so a failure leaves the order untouched.
export async function cancelOrder(id: string, scope: { userId?: string } = {}): Promise<TransitionResult> {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: {
        id,
        ...(scope.userId && { userId: scope.userId }),
        status: { in: [...CANCELLABLE_STATUSES] },
        paymentStatus: 'UNPAID',
      },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    if (count === 0) {
      const order = await tx.order.findFirst({
        where: { id, ...(scope.userId && { userId: scope.userId }) },
        select: { status: true, paymentStatus: true },
      });
      if (!order) return NOT_FOUND;
      if (order.status === 'CANCELLED') return { ok: false, error: 'This order is already cancelled.' };
      if (!canCancel(order)) return { ok: false, error: cancelBlockedReason(order) ?? "This order can't be cancelled." };
      return CHANGED;
    }

    const order = await tx.order.findUnique({
      where: { id },
      select: { number: true, items: { select: { productSlug: true, color: true, quantity: true } } },
    });
    if (order) {
      // OrderItem has no FK to the catalog: an item whose product has since been deleted
      // simply matches no SKU and is skipped. A product that is only hidden or archived
      // still gets its stock back.
      await returnOrderItemsToStock(
        tx,
        order.items,
        formatOrderNumber(order.number).replace('#', ''),
        `Cancelled order ${formatOrderNumber(order.number)}`,
      );
    }
    return { ok: true, message: 'Order cancelled and stock returned.' };
  }, { maxWait: 10_000, timeout: 20_000 });
}
