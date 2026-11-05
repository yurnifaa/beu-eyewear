import 'server-only';

import { isGatewayMethod } from '@/lib/checkout/payment';
import { prisma } from '@/lib/prisma';
import { closeCheckoutSession, createCheckoutSession } from './payrex';
import { syncOrderPayment } from './sync';

export type PaymentPageResult = { ok: true; checkoutUrl: string } | { ok: false; error: string };

const FAILED = 'We couldn’t reach the payment provider. Your order is saved, so you can try paying again from your order page.';

// Gives an order a fresh PayRex payment page and returns where to send the buyer. Used
// right after checkout and by the "Pay now" button on an unpaid order. An older page for
// the same order is closed first, so an order can only ever be paid once.
// The caller must already have authenticated userId.
export async function openPaymentPage(orderId: string, userId: string): Promise<PaymentPageResult> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: { orderBy: { id: 'asc' } } },
  });
  if (!order) return { ok: false, error: 'Order not found.' };
  if (order.status === 'CANCELLED') return { ok: false, error: 'This order was cancelled, so it can’t be paid.' };
  if (order.paymentStatus === 'PAID') return { ok: false, error: 'This order is already paid.' };
  if (!isGatewayMethod(order.paymentMethod)) return { ok: false, error: 'This order can’t be paid online.' };

  try {
    if (order.checkoutSessionId) {
      const outcome = await closeCheckoutSession(order.checkoutSessionId);
      if (outcome === 'paid') {
        await syncOrderPayment(order.id);
        return { ok: false, error: 'This order was just paid.' };
      }
      if (outcome === 'in-progress') {
        return { ok: false, error: 'Your earlier payment is still being processed. Please check back in a few minutes.' };
      }
    }

    const session = await createCheckoutSession({
      id: order.id,
      number: order.number,
      total: order.total,
      shippingFee: order.shippingFee,
      paymentMethod: order.paymentMethod,
      items: order.items,
    });

    // Saved only if the order is still payable: a cancel that slipped in meanwhile wins.
    const { count } = await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: 'UNPAID', status: { not: 'CANCELLED' } },
      data: { checkoutSessionId: session.id },
    });
    if (count === 0) {
      await closeCheckoutSession(session.id).catch(() => undefined);
      return { ok: false, error: 'This order can no longer be paid.' };
    }
    return { ok: true, checkoutUrl: session.checkoutUrl };
  } catch (error) {
    console.error('openPaymentPage failed', error instanceof Error ? error.message : 'unknown error');
    return { ok: false, error: FAILED };
  }
}
