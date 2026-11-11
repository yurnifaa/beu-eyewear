import 'server-only';

import { prisma } from '@/lib/prisma';

export interface PromoSuccess {
  ok: true;
  offerId: string;
  offerName: string;
  discountAmount: number;
  freeShipping: boolean;
}

export interface PromoFailure {
  ok: false;
  error: string;
}

export type PromoResult = PromoSuccess | PromoFailure;

function fail(error: string): PromoFailure {
  return { ok: false, error };
}

export async function validatePromoCode(code: string, userId: string, subtotal: number): Promise<PromoResult> {
  const trimmed = code.trim();
  if (!trimmed) return fail('Enter a promo code.');

  const offer = await prisma.offer.findUnique({ where: { code: trimmed.toUpperCase() } });
  if (!offer) return fail("This promo code doesn't exist. Please check the code and try again.");
  if (!offer.isActive) return fail('This promo code is no longer available.');

  if (offer.endsAt) {
    const now = new Date();
    if (offer.endsAt <= now) {
      const dateStr = offer.endsAt.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric' });
      return fail(`This promo code expired on ${dateStr}.`);
    }
  }

  if (offer.maxRedemptions !== null && offer.currentRedemptions >= offer.maxRedemptions) {
    return fail('This promo code has been fully redeemed.');
  }

  if (offer.eligibility === 'FIRST_ORDER') {
    const paidOrderCount = await prisma.order.count({
      where: { userId, paymentStatus: 'PAID' },
    });
    if (paidOrderCount > 0) return fail('This promo code is for first-time orders only.');
  }

  const alreadyUsed = await prisma.order.count({
    where: { userId, offerId: offer.id, status: { not: 'CANCELLED' } },
  });
  if (alreadyUsed > 0) return fail("You've already used this promo code.");

  if (offer.minOrderAmount !== null && subtotal < offer.minOrderAmount) {
    return fail(`Minimum order of ₱${offer.minOrderAmount.toLocaleString()} required for this code.`);
  }

  const isFreeShipping = offer.kind === 'FIXED_AMOUNT' && offer.value === 0 && offer.name.toLowerCase().includes('shipping');

  let discountAmount = 0;
  if (!isFreeShipping) {
    if (offer.kind === 'PERCENT') {
      discountAmount = Math.round(subtotal * offer.value / 100);
    } else {
      discountAmount = offer.value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  return {
    ok: true,
    offerId: offer.id,
    offerName: offer.name,
    discountAmount,
    freeShipping: isFreeShipping,
  };
}
