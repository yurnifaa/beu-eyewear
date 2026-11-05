'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import type { FormState } from '@/lib/auth/types';
import { revalidateOrderViews } from '@/lib/orders/revalidate';
import { cancelOrder } from '@/lib/orders/transitions';
import { openPaymentPage } from '@/lib/payments/checkout';

// Same rules as the admin cancel (lib/orders/rules.ts), scoped to the owner so
// someone else's order id just reads as "not found".
export async function cancelMyOrder(id: string): Promise<FormState> {
  const user = await requireUser(`/account/orders/${id}`);
  try {
    const result = await cancelOrder(id, { userId: user.id });
    revalidateOrderViews(id);
    return result.ok ? { success: result.message } : { error: result.error };
  } catch (error) {
    console.error('cancelMyOrder failed', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

// "Pay now" on an unpaid order: a fresh payment page, replacing any earlier one.
export async function payMyOrder(id: string): Promise<FormState> {
  const user = await requireUser(`/account/orders/${id}`);
  const payment = await openPaymentPage(id, user.id);
  if (!payment.ok) return { error: payment.error };
  // Outside any try/catch: redirect() works by throwing.
  redirect(payment.checkoutUrl);
}
