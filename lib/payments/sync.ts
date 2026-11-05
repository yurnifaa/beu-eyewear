import 'server-only';

import { prisma } from '@/lib/prisma';
import { paidPaymentFromIntent, retrieveCheckoutSession, type PaidPayment } from './payrex';

// How an order learns it has been paid. There are two routes in, and both end up in
// recordGatewayPayment so they follow exactly the same rules:
//   1. PayRex's webhook (app/api/webhooks/payrex/route.ts), the normal route.
//   2. syncOrderPayment, which asks PayRex directly. It covers a webhook that is late,
//      lost, or can't reach localhost, and runs when the buyer lands back on the site.

export type PaymentRecordResult =
  | 'paid' // this call marked the order paid
  | 'already-paid' // it was paid before (a repeated webhook, or the webhook won the race)
  | 'not-paid' // the payment page has no successful payment (yet)
  | 'unknown-order' // no order matches the payment
  | 'amount-mismatch' // PayRex took a different amount than the order total
  | 'order-cancelled'; // paid after the order was cancelled: needs a manual refund

export async function recordGatewayPayment(payment: PaidPayment): Promise<{ result: PaymentRecordResult; orderId?: string }> {
  // createCheckoutSession puts our order id in the payment's metadata.
  const order = payment.orderId
    ? await prisma.order.findUnique({ where: { id: payment.orderId }, select: { id: true, total: true, status: true, paymentStatus: true } })
    : null;
  if (!order) {
    console.error(`PayRex payment ${payment.paymentRef} matches no order (reference: ${payment.orderId ?? 'none'})`);
    return { result: 'unknown-order' };
  }
  if (order.paymentStatus === 'PAID') return { result: 'already-paid', orderId: order.id };

  // Never trust a payment for the wrong amount: leave the order unpaid for a person to look at.
  const expected = Math.round(order.total * 100);
  if (payment.amountCentavos !== expected) {
    console.error(`PayRex payment ${payment.paymentRef} is for ${payment.amountCentavos} centavos but order ${order.id} is ${expected}`);
    return { result: 'amount-mismatch', orderId: order.id };
  }

  // Conditional update, same guard as markOrderPaid: two deliveries at once can't both win.
  const { count } = await prisma.order.updateMany({
    where: { id: order.id, paymentStatus: 'UNPAID', status: { not: 'CANCELLED' } },
    data: { paymentStatus: 'PAID', paidAt: new Date(), paymentRef: payment.paymentRef },
  });
  if (count === 1) return { result: 'paid', orderId: order.id };

  const current = await prisma.order.findUnique({ where: { id: order.id }, select: { status: true, paymentStatus: true } });
  if (current?.paymentStatus === 'PAID') return { result: 'already-paid', orderId: order.id };
  if (current?.status === 'CANCELLED') {
    // The stock already went back on the shelf. Refund this payment in the PayRex dashboard.
    console.error(`REFUND NEEDED: PayRex payment ${payment.paymentRef} arrived after order ${order.id} was cancelled`);
    return { result: 'order-cancelled', orderId: order.id };
  }
  return { result: 'not-paid', orderId: order.id };
}

// Asks PayRex whether the order's payment page has been paid, and records it if so.
// Returns null when there is nothing to check or PayRex couldn't be reached (the
// webhook, or the next visit, will catch up). Writes the database only: it is safe to call
// while rendering a page, so it does not revalidate anything.
export async function syncOrderPayment(orderId: string): Promise<PaymentRecordResult | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { checkoutSessionId: true, paymentStatus: true },
  });
  if (!order?.checkoutSessionId || order.paymentStatus === 'PAID') return null;

  try {
    const session = await retrieveCheckoutSession(order.checkoutSessionId);
    const payment = paidPaymentFromIntent(session.intent);
    if (!payment) return 'not-paid';
    // We know which order this page belongs to, whatever the payment's own metadata says.
    // If the metadata does name an order, it has to be this one.
    if (payment.orderId && payment.orderId !== orderId) {
      console.error(`PayRex session ${session.id} belongs to order ${orderId} but its payment names ${payment.orderId}`);
      return 'unknown-order';
    }
    return (await recordGatewayPayment({ ...payment, orderId })).result;
  } catch (error) {
    console.error('syncOrderPayment failed', error instanceof Error ? error.message : 'unknown error');
    return null;
  }
}
