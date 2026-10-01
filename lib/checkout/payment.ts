// Mirrors the Prisma PaymentMethod enum (kept free of @prisma/client so the
// client bundle can import it). Only the choice is recorded for now: no payment
// is taken, and orders start as UNPAID until PayMongo is wired in.
export const PAYMENT_METHOD_IDS = ['CARD', 'WALLET', 'BANK'] as const;
export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodId, string> = {
  CARD: 'Card',
  WALLET: 'Wallet',
  BANK: 'Bank',
};
