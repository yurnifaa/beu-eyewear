import { SHIPPING_METHODS, type ShippingMethodId } from '@/lib/checkout/shipping';

export interface OrderTotals {
  subtotal: number;
  shippingFee: number;
  total: number;
}

// The one place totals are computed: the form uses it for display and
// placeOrder uses it for the amounts that are actually stored. The fee comes
// from the shipping_methods sheet tab (shippingFee); the built-in table is
// only the fallback.
export function calcTotals(subtotal: number, shippingMethod: ShippingMethodId, shippingFee?: number): OrderTotals {
  shippingFee ??= SHIPPING_METHODS[shippingMethod].fee;
  return { subtotal, shippingFee, total: subtotal + shippingFee };
}
