import 'server-only';

import type { Prisma } from '@prisma/client';
import { returnOrderItemsToStock } from '@/lib/catalog/stock';
import { notifyOrderPaid } from '@/lib/email/order-confirmation';
import { formatOrderNumber } from '@/lib/format';
import { closeCheckoutSession } from '@/lib/payments/payrex';
import { syncOrderPayment } from '@/lib/payments/sync';
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

// Card and GCash payments are recorded automatically by lib/payments/sync.ts. This is the
// admin's manual fallback, for money that arrived some other way.
export async function markOrderPaid(id: string): Promise<TransitionResult> {
  const { count } = await prisma.order.updateMany({
    where: { id, paymentStatus: 'UNPAID', status: { not: 'CANCELLED' } },
    data: { paymentStatus: 'PAID', paidAt: new Date() },
  });
  if (count === 1) {
    // Only the call that wins the update gets here, so the buyer is emailed exactly once.
    await notifyOrderPaid(id);
    // Best effort: retire the payment page so the buyer can't pay a second time.
    const order = await prisma.order.findUnique({ where: { id }, select: { checkoutSessionId: true } });
    if (order?.checkoutSessionId) {
      await closeCheckoutSession(order.checkoutSessionId).catch((error) =>
        console.error('closing payment page after manual payment failed', error instanceof Error ? error.message : 'unknown error'),
      );
    }
    return { ok: true, message: 'Order marked as paid.' };
  }

  const order = await prisma.order.findUnique({ where: { id }, select: { status: true, paymentStatus: true } });
  if (!order) return NOT_FOUND;
  if (order.paymentStatus === 'PAID') return { ok: false, error: 'This order is already paid.' };
  if (!canMarkPaid(order)) return { ok: false, error: "A cancelled order can't be marked as paid." };
  return CHANGED;
}

// An order with a payment page has to have that page closed before it is
// cancelled, otherwise the buyer could still pay for an order whose stock has gone back
// on the shelf. This talks to PayRex, so it runs before (not inside) the database
// transaction. Returns a failure to hand back to the caller, or null when it's fine to go on.
async function closePaymentPage(id: string, userId?: string): Promise<TransitionResult | null> {
  const order = await prisma.order.findFirst({
    where: { id, ...(userId && { userId }) },
    select: { checkoutSessionId: true, status: true, paymentStatus: true },
  });
  // Only when the cancel itself can go ahead; otherwise the page would be closed for nothing.
  if (!order?.checkoutSessionId || !canCancel(order)) return null;

  let outcome;
  try {
    outcome = await closeCheckoutSession(order.checkoutSessionId);
  } catch (error) {
    console.error('closing payment page failed', error instanceof Error ? error.message : 'unknown error');
    return { ok: false, error: "We couldn't reach the payment provider to close this order's payment page. Please try again in a moment." };
  }

  if (outcome === 'paid') {
    // The webhook hasn't landed yet. Record the payment now so the order shows as paid.
    await syncOrderPayment(id);
    return { ok: false, error: "A payment for this order just went through, so it can't be cancelled." };
  }
  if (outcome === 'in-progress') {
    return { ok: false, error: 'A payment for this order is still being processed. Please check back in a few minutes.' };
  }
  return null;
}

// userId scopes the cancel to its owner for the customer-side action; the admin
// action leaves it out. The units go back into stock (with a RETURN movement) in the
// same transaction as the status change, so a failure leaves the order untouched.
export async function cancelOrder(id: string, scope: { userId?: string } = {}): Promise<TransitionResult> {
  const blocked = await closePaymentPage(id, scope.userId);
  if (blocked) return blocked;

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
