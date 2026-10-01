'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { calcTotals } from '@/lib/checkout/pricing';
import type { PlaceOrderState } from '@/lib/checkout/types';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validation/checkout';

const TEXT_FIELDS = ['fullName', 'address', 'city', 'province', 'zip', 'phone'] as const;

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function placeOrder(_prevState: PlaceOrderState, formData: FormData): Promise<PlaceOrderState> {
  // Server Actions are reachable by direct POST, so authenticate here rather
  // than relying on the page having been gated.
  const user = await requireUser();

  const saveAddress = text(formData, 'saveAddress') === 'on';
  // Echoed back on errors so the typed address (and the checkbox) survive the
  // form reset React does after an action.
  const values: Record<string, string> = {
    ...Object.fromEntries(TEXT_FIELDS.map((key) => [key, text(formData, key)])),
    saveAddress: saveAddress ? 'on' : '',
  };

  let rawLines: unknown;
  try {
    rawLines = JSON.parse(text(formData, 'lines') || '[]');
  } catch {
    return { values, error: 'We couldn’t read your cart. Please refresh the page and try again.' };
  }

  const parsed = checkoutSchema.safeParse({
    ...Object.fromEntries(TEXT_FIELDS.map((key) => [key, values[key]])),
    shippingMethod: text(formData, 'shippingMethod'),
    paymentMethod: text(formData, 'paymentMethod'),
    lines: rawLines,
  });
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { lines, shippingMethod, paymentMethod, ...address } = parsed.data;

  // The client only says *what* to buy. Names, prices and which colors exist
  // all come from the database.
  const products = await prisma.product.findMany({
    where: { slug: { in: [...new Set(lines.map((line) => line.slug))] } },
    select: { slug: true, name: true, price: true, colors: true },
  });
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const items = [];
  for (const line of lines) {
    const product = bySlug.get(line.slug);
    if (!product) {
      return { values, error: 'Some items in your cart are no longer available. Please review your cart and try again.' };
    }

    const color = line.color || undefined;
    if (!color && product.colors.length > 0) {
      return { values, error: `Please choose a color for ${product.name} in your cart.` };
    }
    if (color && !product.colors.includes(color)) {
      return { values, error: `${product.name} is no longer available in that color. Please update your cart.` };
    }

    items.push({
      productSlug: product.slug,
      name: product.name,
      color: color ?? null,
      unitPrice: product.price,
      quantity: line.quantity,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totals = calcTotals(subtotal, shippingMethod);

  let orderId: string;
  try {
    // One nested create is atomic: the order and its items both exist or neither does.
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        shippingMethod,
        paymentMethod,
        ...totals,
        shipName: address.fullName,
        shipAddress: address.address,
        shipCity: address.city,
        shipProvince: address.province,
        shipZip: address.zip,
        shipPhone: address.phone,
        items: { create: items },
      },
      select: { id: true },
    });
    orderId = order.id;
  } catch (error) {
    console.error('placeOrder failed', error);
    return { values, error: 'We couldn’t place your order. Please try again.' };
  }

  // After the order exists, and best-effort: a failure here must not turn a
  // placed order into an error the buyer would retry (and double-order).
  if (saveAddress) {
    try {
      const { fullName, address: street, city, province, zip, phone } = address;
      const fields = { fullName, address: street, city, province, zip, phone };
      await prisma.savedAddress.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...fields },
        update: fields,
      });
      revalidatePath('/account/addresses');
    } catch (error) {
      console.error('saving address failed', error);
    }
  }

  revalidatePath('/account/orders');
  return { orderId };
}
