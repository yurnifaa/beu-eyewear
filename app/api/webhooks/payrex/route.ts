import { NextResponse } from 'next/server';
import { paidPaymentFromIntent, verifyWebhook } from '@/lib/payments/payrex';
import { recordGatewayPayment } from '@/lib/payments/sync';
import { revalidateOrderViews } from '@/lib/orders/revalidate';

// PayRex calls this when something happens to a payment. Register it in the PayRex
// dashboard (Developers > Webhooks) as https://<your-domain>/api/webhooks/payrex, listening
// to the payment_intent.succeeded event, and put the endpoint's secret in
// PAYREX_WEBHOOK_SECRET.
//
// Anything but a 2xx makes PayRex deliver the event again (for up to 3 days). So: a bad
// signature or a database failure is an error, and everything we simply don't care about
// is a 200 so it isn't repeated.

export async function POST(request: Request) {
  // The signature covers the exact bytes PayRex sent, so read the body as text and only
  // parse it after it has been checked.
  const rawBody = await request.text();
  const event = verifyWebhook(rawBody, request.headers.get('payrex-signature'));
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true });
  }

  const payment = paidPaymentFromIntent(event.data);
  if (!payment) {
    // A succeeded event whose payment we can't read. Repeating it won't change that.
    console.error('PayRex webhook: unreadable payment_intent.succeeded payload');
    return NextResponse.json({ received: true });
  }

  try {
    const { result, orderId } = await recordGatewayPayment(payment);
    if (result === 'paid' && orderId) revalidateOrderViews(orderId);
    return NextResponse.json({ received: true, result });
  } catch (error) {
    console.error('PayRex webhook failed', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Could not record the payment' }, { status: 500 });
  }
}
