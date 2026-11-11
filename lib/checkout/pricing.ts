import { SHIPPING_METHODS, type ShippingMethodId } from '@/lib/checkout/shipping';

export interface OrderTotals {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
}

export function calcTotals(
  subtotal: number,
  shippingMethod: ShippingMethodId,
  shippingFee?: number,
  discountAmount = 0,
  freeShipping = false,
): OrderTotals {
  shippingFee ??= SHIPPING_METHODS[shippingMethod].fee;
  if (freeShipping) shippingFee = 0;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);
  return { subtotal, shippingFee, discountAmount, total };
}
