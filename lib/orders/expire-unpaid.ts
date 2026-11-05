import 'server-only';

import { CANCELLABLE_STATUSES } from '@/lib/orders/rules';
import { cancelOrder } from '@/lib/orders/transitions';
import { prisma } from '@/lib/prisma';

// An order whose buyer walked away from the payment page would hold its stock for ever
// (PayRex lets the page lapse after 24 hours, but that doesn't touch our stock). This
// cancels such orders (closing the payment page and putting the stock back) once they've
// been unpaid for this long.
export const UNPAID_ORDER_TTL_HOURS = 24;

// Stop starting new cancels after this long, so one run always finishes inside the
// function's time limit. Whatever is left is picked up by the next run.
const TIME_BUDGET_MS = 40_000;
const MAX_PER_RUN = 100;

export interface ExpireResult {
  cancelledIds: string[];
  // Left alone: paid in the meantime, already cancelled, or PayRex couldn't be reached.
  skipped: number;
}

export async function cancelStaleUnpaidOrders(olderThanHours = UNPAID_ORDER_TTL_HOURS): Promise<ExpireResult> {
  const startedAt = Date.now();
  const cutoff = new Date(startedAt - olderThanHours * 60 * 60 * 1000);

  const stale = await prisma.order.findMany({
    where: {
      paymentStatus: 'UNPAID',
      status: { in: [...CANCELLABLE_STATUSES] },
      createdAt: { lt: cutoff },
      // Only orders that have a payment page. Older unpaid orders (placed before
      // the gateway existed, then paid by hand) have none and must be left alone.
      checkoutSessionId: { not: null },
    },
    orderBy: { createdAt: 'asc' },
    take: MAX_PER_RUN,
    select: { id: true },
  });

  const result: ExpireResult = { cancelledIds: [], skipped: 0 };
  for (const { id } of stale) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;
    try {
      // cancelOrder closes the payment page first. If the buyer paid in the meantime it
      // refuses (and records the payment), which is the right outcome here too.
      const outcome = await cancelOrder(id);
      if (outcome.ok) result.cancelledIds.push(id);
      else result.skipped += 1;
    } catch (error) {
      console.error('expiring unpaid order failed', id, error instanceof Error ? error.message : 'unknown error');
      result.skipped += 1;
    }
  }
  return result;
}
