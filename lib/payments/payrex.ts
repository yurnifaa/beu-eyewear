import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { GATEWAY_METHOD_TYPES, type PaymentMethodId } from '@/lib/checkout/payment';
import { appUrl } from '@/lib/email/send';
import { formatOrderNumber } from '@/lib/format';

// A thin client for PayRex's hosted Checkout. The buyer is sent to PayRex's own page to
// pay, so card numbers never reach this server. Plain fetch, no SDK.
// API reference: https://docs.payrex.com/docs/api/checkout_sessions

const API_URL = 'https://api.payrexhq.com';
const REQUEST_TIMEOUT_MS = 15_000;

export class PayRexError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function secretKey() {
  const key = process.env.PAYREX_SECRET_KEY;
  if (!key) throw new Error('PAYREX_SECRET_KEY is not set');
  return key;
}

// Test keys start with sk_test_, live keys with sk_live_. A live key only ever sees live
// events and the other way round.
function isLiveMode() {
  return secretKey().startsWith('sk_live_');
}

// Orders store whole pesos; PayRex wants centavos.
const toCentavos = (pesos: number) => Math.round(pesos * 100);

// PayRex reads form-encoded bodies, not JSON. Nested objects become `a[b]=1`, a list of
// plain values `a[]=1`, and a list of objects `a[0][b]=1`.
function encodeForm(value: unknown, key = '', pairs: [string, string][] = []): [string, string][] {
  if (value === undefined || value === null) return pairs;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const isPlain = item === null || typeof item !== 'object';
      encodeForm(item, `${key}[${isPlain ? '' : index}]`, pairs);
    });
  } else if (typeof value === 'object') {
    for (const [name, child] of Object.entries(value)) encodeForm(child, key ? `${key}[${name}]` : name, pairs);
  } else {
    pairs.push([key, String(value)]);
  }
  return pairs;
}

async function request(method: 'GET' | 'POST', path: string, body?: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    // HTTP Basic: the secret key is the username and the password is empty.
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretKey()}:`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body ? new URLSearchParams(encodeForm(body)).toString() : undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const raw = await response.text().catch(() => '');
  let json: unknown = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }
  if (!response.ok) {
    // Keep PayRex's own explanation: it names the bad field, which is the fastest way to
    // fix a rejected request. Nothing secret is in it. A reply that isn't JSON (an empty 403, a
    // gateway error page) is kept as plain text, so the log never says just "failed (403)".
    const detail = (json ? JSON.stringify(json) : raw.replace(/\s+/g, ' ').trim()).slice(0, 400);
    throw new PayRexError(`PayRex ${method} ${path} failed (${response.status})${detail ? `: ${detail}` : ''}`, response.status);
  }
  return json;
}

// ---------------------------------------------------------------------------
// Checkout sessions
// ---------------------------------------------------------------------------

export interface GatewayOrder {
  id: string;
  number: number;
  total: number;
  shippingFee: number;
  paymentMethod: PaymentMethodId;
  items: { name: string; color: string | null; unitPrice: number; quantity: number }[];
}

// PayRex's gateway answers a bare "403 Forbidden" web page, before it even looks at the API key, when
// a return link points at localhost or 127.0.0.1 (checked Nov 2026; other hosts, including
// beu.localhost, a LAN address, plain http and tunnel addresses, get through). That 403 looks like an
// outage, so say what is wrong instead of sending a request that cannot work.
function assertReachableReturnUrl(base: string) {
  const host = new URL(base).hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    throw new Error(
      `APP_URL is ${base}, and PayRex rejects return links to localhost. For local testing set APP_URL=http://beu.localhost:3000 and open the site at that address (or use an https tunnel).`,
    );
  }
}

// Creates the hosted payment page for an order and returns where to send the buyer.
// A session is one-use and expires by itself after 24 hours.
export async function createCheckoutSession(order: GatewayOrder): Promise<{ id: string; checkoutUrl: string }> {
  const lineItems = order.items.map((item) => ({
    name: item.color ? `${item.name} (${item.color})` : item.name,
    amount: toCentavos(item.unitPrice),
    quantity: item.quantity,
  }));
  if (order.shippingFee > 0) {
    lineItems.push({ name: 'Shipping', amount: toCentavos(order.shippingFee), quantity: 1 });
  }

  // What PayRex charges is the sum of these lines, so it must be exactly what the order
  // says. A mismatch would charge the wrong amount, so refuse to send it.
  const charged = lineItems.reduce((sum, line) => sum + line.amount * line.quantity, 0);
  if (charged !== toCentavos(order.total)) {
    throw new Error(`Order ${order.id} total (${toCentavos(order.total)}) doesn't match its payment lines (${charged})`);
  }

  const base = appUrl();
  assertReachableReturnUrl(base);
  const json = await request('POST', '/checkout_sessions', {
    currency: 'PHP',
    line_items: lineItems,
    payment_methods: GATEWAY_METHOD_TYPES[order.paymentMethod],
    description: `Order ${formatOrderNumber(order.number)}`,
    // How the payment is traced back to the order: PayRex copies metadata onto the
    // payment it creates (see paidPaymentFromIntent).
    customer_reference_id: order.id,
    metadata: { orderId: order.id, orderNumber: formatOrderNumber(order.number) },
    success_url: `${base}/order-confirm/${order.id}`,
    cancel_url: `${base}/account/orders/${order.id}`,
  });

  const created = z.object({ id: z.string(), url: z.url() }).parse(json);
  return { id: created.id, checkoutUrl: created.url };
}

// What a payment looks like once PayRex says it succeeded. Amount is in centavos.
export interface PaidPayment {
  // From the metadata we attached; null if PayRex didn't carry it over.
  orderId: string | null;
  // PayRex's payment id, kept on the order for reference and refunds.
  paymentRef: string;
  amountCentavos: number;
}

const intentSchema = z.object({
  id: z.string(),
  amount: z.number().nullish(),
  amount_received: z.number().nullish(),
  status: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
  latest_payment: z.union([z.string(), z.object({ id: z.string() })]).nullish(),
});

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Reads a Payment Intent (from a webhook event or the API) and returns the payment if it
// has succeeded, otherwise null. Accepts the intent either directly or wrapped as
// `{ resource: {...} }`: PayRex's own SDK samples disagree about which the event uses.
export function paidPaymentFromIntent(raw: unknown): PaidPayment | null {
  const candidate = isObject(raw) && isObject(raw.resource) ? raw.resource : raw;
  const parsed = intentSchema.safeParse(candidate);
  if (!parsed.success || parsed.data.status !== 'succeeded') return null;

  const intent = parsed.data;
  const amount = intent.amount_received ?? intent.amount;
  if (typeof amount !== 'number') return null;

  const orderId = intent.metadata?.orderId;
  const latest = typeof intent.latest_payment === 'string' ? intent.latest_payment : intent.latest_payment?.id;
  return {
    orderId: typeof orderId === 'string' && orderId ? orderId : null,
    paymentRef: latest ?? intent.id,
    amountCentavos: amount,
  };
}

export interface CheckoutSession {
  id: string;
  status: string | null;
  // The Payment Intent behind the session, as PayRex returned it.
  intent: unknown;
}

const sessionSchema = z.object({
  id: z.string(),
  status: z.string().nullish(),
  payment_intent: z.union([z.string(), z.record(z.string(), z.unknown())]).nullish(),
});

export async function retrieveCheckoutSession(id: string): Promise<CheckoutSession> {
  const json = await request('GET', `/checkout_sessions/${encodeURIComponent(id)}`);
  const session = sessionSchema.parse(json);

  // `payment_intent` may arrive as just an id (or without its status); fetch the full one.
  let intent: unknown = session.payment_intent;
  const intentId = typeof intent === 'string' ? intent : isObject(intent) && typeof intent.id === 'string' ? intent.id : null;
  if (intentId && !(isObject(intent) && typeof intent.status === 'string')) {
    intent = await request('GET', `/payment_intents/${encodeURIComponent(intentId)}`);
  }
  return { id: session.id, status: session.status ?? null, intent };
}

export type CloseResult = 'closed' | 'paid' | 'in-progress';

// Shuts a payment page so it can't be paid any more. A page that is abandoned would
// otherwise stay payable until it times out, long after its order has been cancelled.
//   closed       the page is gone (or already was): safe to cancel or replace the order
//   paid         the buyer had already paid: the order must NOT be cancelled
//   in-progress  a payment is under way (e.g. a GCash approval): wait for the outcome
export async function closeCheckoutSession(id: string): Promise<CloseResult> {
  try {
    await request('POST', `/checkout_sessions/${encodeURIComponent(id)}/expire`);
    return 'closed';
  } catch (error) {
    if (!(error instanceof PayRexError)) throw error;
    // The session doesn't exist for this key (for example it was made with a test key).
    if (error.status === 404) return 'closed';
    // PayRex refuses with 400 when it can't expire the session (already expired, or paid
    // or mid-payment); look at it to tell which.
    if (error.status !== 400) throw error;
  }

  const session = await retrieveCheckoutSession(id);
  if (paidPaymentFromIntent(session.intent)) return 'paid';
  return session.status === 'expired' ? 'closed' : 'in-progress';
}

// ---------------------------------------------------------------------------
// Webhooks
// ---------------------------------------------------------------------------

const webhookEventSchema = z.object({
  type: z.string(),
  data: z.unknown(),
  livemode: z.boolean().optional(),
});
export type WebhookEvent = { type: string; livemode: boolean; data: unknown };

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// Checks that a webhook really came from PayRex. PayRex signs `{timestamp}.{raw body}`
// with HMAC-SHA256 (hex) using the endpoint's secret and sends it as
//   Payrex-Signature: t=<timestamp>,te=<test signature>,li=<live signature>
// The raw, unparsed body is required: re-serialising the JSON changes the bytes.
// There is deliberately no timestamp window: PayRex re-delivers failed events for days,
// and a replayed event is harmless because marking an order paid is idempotent and its
// amount is re-checked.
export function verifyWebhook(rawBody: string, signatureHeader: string | null): WebhookEvent | null {
  const secret = process.env.PAYREX_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return null;

  const parts = new Map<string, string>();
  for (const part of signatureHeader.split(',')) {
    const [key, ...rest] = part.trim().split('=');
    if (key) parts.set(key, rest.join('='));
  }
  const timestamp = parts.get('t');
  if (!timestamp) return null;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const testSignature = parts.get('te');
  const liveSignature = parts.get('li');
  // Which signature matched says which mode the event came from.
  const matchedLive = !!liveSignature && safeEqual(liveSignature, expected);
  const matchedTest = !!testSignature && safeEqual(testSignature, expected);
  if (!matchedLive && !matchedTest) return null;
  const livemode = matchedLive;

  // A test event must never mark a real order paid, nor a live event a test one.
  if (livemode !== isLiveMode()) return null;

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return null;
  }
  const event = webhookEventSchema.safeParse(body);
  if (!event.success) return null;
  // If the body states its mode, it has to agree with the signature.
  if (event.data.livemode !== undefined && event.data.livemode !== livemode) return null;

  return { type: event.data.type, livemode, data: event.data.data };
}
