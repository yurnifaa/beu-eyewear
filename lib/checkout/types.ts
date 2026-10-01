import type { FormState } from '@/lib/auth/types';

export interface PlaceOrderState extends FormState {
  // Set once the order exists; the form uses it to clear the cart and navigate.
  orderId?: string;
  // Echo of the submitted text fields. React resets uncontrolled inputs after a
  // form action, so without this a validation error would wipe what was typed.
  values?: Record<string, string>;
}
