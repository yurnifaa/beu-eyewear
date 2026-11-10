import 'server-only';

import { after } from 'next/server';
import { PAYMENT_METHOD_LABELS } from '@/lib/checkout/payment';
import { SHIPPING_METHODS, deliveryEstimate } from '@/lib/checkout/shipping';
import { STANDARD_COLOR } from '@/lib/catalog/variants';
import { getShippingMethods, getStoreSettings } from '@/lib/catalog/queries';
import { formatOrderNumber } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { appUrl, sendEmail } from './send';
import { orderConfirmationTemplate } from './templates';

async function sendPaymentConfirmation(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { email: true, name: true } }, items: { orderBy: { id: 'asc' } } },
  });
  if (!order || order.paymentStatus !== 'PAID') return;

  // These two only make the email nicer, so a failure in either must not stop it being sent.
  const [methods, settings] = await Promise.all([
    getShippingMethods().catch(() => []),
    getStoreSettings().catch(() => null),
  ]);
  const method = methods.find((candidate) => candidate.id === order.shippingMethod);
  const fallback = SHIPPING_METHODS[order.shippingMethod];

  const url = `${appUrl()}/account/orders/${order.id}`;
  const email = orderConfirmationTemplate({
    customerName: order.user.name,
    orderNumber: formatOrderNumber(order.number),
    paidAt: order.paidAt ?? new Date(),
    paymentMethod: PAYMENT_METHOD_LABELS[order.paymentMethod],
    paymentRef: order.paymentRef,
    items: order.items.map((item) => ({
      name: item.name,
      color: item.color && item.color !== STANDARD_COLOR ? item.color : undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    shippingLabel: method?.label ?? fallback.label,
    total: order.total,
    shipName: order.shipName,
    shipAddress: order.shipAddress,
    shipCity: order.shipCity,
    shipProvince: order.shipProvince,
    shipZip: order.shipZip,
    shipPhone: order.shipPhone,
    deliveryEstimate: deliveryEstimate(order.shippingMethod, order.createdAt, method ?? fallback),
    orderUrl: url,
    supportEmail: settings?.supportEmail,
  });

  await sendEmail({ to: order.user.email, ...email, devLink: url });
}

async function sendSafely(orderId: string) {
  try {
    await sendPaymentConfirmation(orderId);
  } catch (error) {
    // Best effort: the payment is already recorded, and a failure here must never turn a webhook
    // into a 500 (PayRex would keep re-delivering it).
    console.error(`payment confirmation email for order ${orderId} failed`, error instanceof Error ? error.message : 'unknown error');
  }
}

// Call once, right where an order is marked paid. Runs after the response is sent where it can,
// so Brevo's speed never slows the webhook or the page the buyer is looking at.
export function notifyOrderPaid(orderId: string): void | Promise<void> {
  try {
    after(() => sendSafely(orderId));
  } catch {
    // Not inside a request (a script, say): there is no "after", so just send now.
    return sendSafely(orderId);
  }
}
