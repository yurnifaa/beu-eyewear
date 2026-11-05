import type { FormState } from '@/lib/auth/types';

export interface PlaceOrderState extends FormState {
  // Set once the order exists; the form uses it to clear the cart and navigate.
  orderId?: string;
  // The payment provider's page for the order. When present the buyer is sent there to pay.
  checkoutUrl?: string;
  // The order exists but its payment page couldn't be opened. The buyer is sent to the
  // order, where "Pay now" tries again.
  paymentError?: string;
  // Echo of the submitted text fields. React resets uncontrolled inputs after a
  // form action, so without this a validation error would wipe what was typed.
  values?: Record<string, string>;
}
