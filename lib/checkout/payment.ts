// Mirrors the Prisma PaymentMethod enum (kept free of @prisma/client so the
// client bundle can import it).
//
// Both methods are paid on the payment provider's hosted page (lib/payments/payrex.ts):
// the buyer's card number is typed there, never into this site.

// Shown to buyers wherever the provider is named. The one place to change if the site
// ever moves to a different gateway.
export const PAYMENT_PROVIDER_NAME = 'PayRex';

// What a buyer can choose at checkout.
export const PAYMENT_METHOD_IDS = ['CARD', 'WALLET'] as const;
export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[number];

// Every value an order can hold. BANK is no longer offered, but orders placed before
// the gateway was connected still carry it, so it keeps a label.
export type StoredPaymentMethod = PaymentMethodId | 'BANK';

export const PAYMENT_METHOD_LABELS: Record<StoredPaymentMethod, string> = {
  CARD: 'Card',
  WALLET: 'GCash',
  BANK: 'Bank',
};

// The provider's name for each method on its checkout page.
export const GATEWAY_METHOD_TYPES: Record<PaymentMethodId, string[]> = {
  CARD: ['card'],
  WALLET: ['gcash'],
};

// Orders placed with these are paid through the gateway. A legacy BANK order never
// has a payment page, so the unpaid-order cleanup and "Pay now" leave it alone.
export function isGatewayMethod(method: StoredPaymentMethod): method is PaymentMethodId {
  return (PAYMENT_METHOD_IDS as readonly string[]).includes(method);
}
