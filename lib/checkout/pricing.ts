import { SHIPPING_METHODS, type ShippingMethodId } from '@/lib/checkout/shipping';

export interface OrderTotals {
  subtotal: number;
  shippingFee: number;
  total: number;
}

// The one place totals are computed: the form uses it for display and
// placeOrder uses it for the amounts that are actually stored.
export function calcTotals(subtotal: number, shippingMethod: ShippingMethodId): OrderTotals {
  const shippingFee = SHIPPING_METHODS[shippingMethod].fee;
  return { subtotal, shippingFee, total: subtotal + shippingFee };
}
