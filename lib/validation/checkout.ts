import { z } from 'zod';
import { ADDRESS_LABEL_MAX, ADDRESS_LIMITS, NAME_PATTERN, NAME_RULE_MESSAGE, normalizePhone } from '@/lib/checkout/address';
import { PAYMENT_METHOD_IDS } from '@/lib/checkout/payment';
import { SHIPPING_METHOD_IDS } from '@/lib/checkout/shipping';
import { optionalSafeText, safeText } from './text';

export const MAX_LINE_QUANTITY = 99;

// Full name only: it is also held to NAME_PATTERN, which already rules out markup. The free-text
// fields below use safeText, which also cleans the text and rejects < and >.
const requiredText =(requiredMessage: string, label: string, max: number) =>
  z.string().trim().min(1, requiredMessage).max(max, `${label} must be ${max} characters or fewer`);

// Philippine mobile: 11 digits starting with 09. Spaces, dashes and
// parentheses (and a pasted +63) are normalized first, so "0917 123 4567" is
// accepted but anything longer than 11 digits is rejected.
const phone = z
  .string()
  .transform(normalizePhone)
  .pipe(z.string().regex(/^09\d{9}$/, 'Enter a 10-digit mobile number starting with 9, e.g. 9171234567'));

// The shipping address fields. Shared by checkout and the saved address.
export const addressSchema = z.object({
  fullName: requiredText('Enter your full name', 'Full name', ADDRESS_LIMITS.fullName).regex(NAME_PATTERN, NAME_RULE_MESSAGE),
  address: safeText({ required: 'Enter your street address', label: 'Address', max: ADDRESS_LIMITS.address }),
  city: safeText({ required: 'Enter your city', label: 'City', max: ADDRESS_LIMITS.city }),
  province: safeText({ required: 'Enter your province', label: 'Province', max: ADDRESS_LIMITS.province }),
  zip: z.string().trim().regex(/^\d{4}$/, 'Enter a 4-digit postal code'),
  phone,
});

// An address-book entry: the shipping fields plus a nickname and default flag.
export const savedAddressSchema = addressSchema.extend({
  label: optionalSafeText({ label: 'Label', max: ADDRESS_LABEL_MAX }).transform((value) => value || null),
  isDefault: z.boolean(),
});

export const cartLineSchema = z.object({
  slug: z.string().min(1).max(200),
  color: z.string().max(100).optional(),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(MAX_LINE_QUANTITY, `You can order at most ${MAX_LINE_QUANTITY} of a single item`),
});

export type CartLineInput = z.infer<typeof cartLineSchema>;

export const checkoutSchema = addressSchema.extend({
  shippingMethod: z.enum(SHIPPING_METHOD_IDS, 'Choose a shipping method'),
  paymentMethod: z.enum(PAYMENT_METHOD_IDS, 'Choose a payment method'),
  lines: z.array(cartLineSchema).min(1, 'Your cart is empty').max(50),
  promoCode: optionalSafeText({ label: 'Promo code', max: 50 }).optional(),
});
