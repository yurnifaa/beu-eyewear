'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { refreshCatalog } from '@/lib/catalog/cache';
import { findVariant, getProductsBySlugs, getShippingMethods } from '@/lib/catalog/queries';
import { OutOfStockError, takeStock } from '@/lib/catalog/stock';
import { MAX_SAVED_ADDRESSES } from '@/lib/checkout/address';
import { calcTotals } from '@/lib/checkout/pricing';
import { validatePromoCode } from '@/lib/checkout/promo';
import type { PlaceOrderState } from '@/lib/checkout/types';
import { formatOrderNumber } from '@/lib/format';
import { openPaymentPage } from '@/lib/payments/checkout';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validation/checkout';

function stockMessage(name: string, available: number) {
  return available <= 0
    ? `${name} just sold out. Please remove it from your cart and try again.`
    : `${name} only has ${available} left in stock. Please lower the quantity in your cart and try again.`;
}

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
    promoCode: text(formData, 'promoCode') || undefined,
  });
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { lines, shippingMethod, paymentMethod, promoCode: submittedCode, ...address } = parsed.data;

  // The client only says *what* to buy. Names, prices and which colors exist all come
  // from the catalog in the database, read here on the server.
  const products = await getProductsBySlugs([...new Set(lines.map((line) => line.slug))]);
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const items: { productSlug: string; name: string; color: string | null; unitPrice: number; quantity: number }[] = [];
  // Stock is tracked per SKU (one per color); the same color can appear on several lines.
  const demand = new Map<string, { name: string; quantity: number; available: number }>();
  for (const line of lines) {
    const product = bySlug.get(line.slug);
    if (!product) {
      return { values, error: 'Some items in your cart are no longer available. Please review your cart and try again.' };
    }

    const color = line.color || undefined;
    if (!color && product.colors.length > 0) {
      return { values, error: `Please choose a color for ${product.name} in your cart.` };
    }
    const variant = findVariant(product, color);
    if (!variant) {
      return { values, error: `${product.name} is no longer available in that color. Please update your cart.` };
    }

    items.push({
      productSlug: product.slug,
      name: product.name,
      color: variant.color === 'Standard' ? null : variant.color,
      unitPrice: product.price,
      quantity: line.quantity,
    });
    const entry = demand.get(variant.sku) ?? { name: product.name, quantity: 0, available: variant.available };
    entry.quantity += line.quantity;
    demand.set(variant.sku, entry);
  }

  // Early, friendly check against the stock just read. The authoritative check is the
  // conditional update inside the transaction below.
  for (const { name, quantity, available } of demand.values()) {
    if (available < quantity) return { values, error: stockMessage(name, available) };
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = (await getShippingMethods()).find((method) => method.id === shippingMethod)?.fee;

  let promoOfferId: string | undefined;
  let promoOfferCode: string | undefined;
  let promoDiscount = 0;
  let promoFreeShipping = false;

  if (submittedCode) {
    const promo = await validatePromoCode(submittedCode, user.id, subtotal);
    if (!promo.ok) return { values, error: promo.error };
    promoOfferId = promo.offerId;
    promoOfferCode = submittedCode.trim().toUpperCase();
    promoDiscount = promo.discountAmount;
    promoFreeShipping = promo.freeShipping;
  }

  const totals = calcTotals(subtotal, shippingMethod, shippingFee, promoDiscount, promoFreeShipping);

  let orderId: string;
  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const created = await tx.order.create({
          data: {
            userId: user.id,
            shippingMethod,
            paymentMethod,
            ...totals,
            offerId: promoOfferId,
            offerCode: promoOfferCode,
            shipName: address.fullName,
            shipAddress: address.address,
            shipCity: address.city,
            shipProvince: address.province,
            shipZip: address.zip,
            shipPhone: address.phone,
            items: { create: items },
          },
          select: { id: true, number: true },
        });

        if (promoOfferId) {
          await tx.$executeRaw`
            UPDATE "Offer"
            SET "currentRedemptions" = "currentRedemptions" + 1
            WHERE "id" = ${promoOfferId}
              AND ("maxRedemptions" IS NULL OR "currentRedemptions" < "maxRedemptions")
          `;
        }

        await takeStock(
          tx,
          [...demand].map(([sku, { name, quantity }]) => ({ sku, name, quantity })),
          formatOrderNumber(created.number).replace('#', ''),
          `Order ${formatOrderNumber(created.number)}`,
        );
        return created;
      },
      { maxWait: 10_000, timeout: 20_000 },
    );
    orderId = order.id;
  } catch (error) {
    if (error instanceof OutOfStockError) {
      return { values, error: stockMessage(error.productName, error.available) };
    }
    console.error('placeOrder failed', error instanceof Error ? error.message : 'unknown error');
    return { values, error: 'We couldn’t place your order. Please try again.' };
  }

  // After the order exists, and best-effort: a failure here must not turn a
  // placed order into an error the buyer would retry (and double-order).
  if (saveAddress) {
    try {
      const { fullName, address: street, city, province, zip, phone } = address;
      const fields = { fullName, address: street, city, province, zip, phone };
      await prisma.$transaction(async (tx) => {
        const saved = await tx.savedAddress.findMany({
          where: { userId: user.id },
          select: { fullName: true, address: true, city: true, province: true, zip: true, phone: true },
        });
        if (saved.length >= MAX_SAVED_ADDRESSES) return;
        // Ordering the same address twice shouldn't fill the address book.
        if (saved.some((existing) => TEXT_FIELDS.every((key) => existing[key] === fields[key]))) return;

        await tx.savedAddress.create({
          data: { userId: user.id, ...fields, isDefault: saved.length === 0 },
        });
      });
      revalidatePath('/account/addresses');
    } catch (error) {
      console.error('saving address failed', error);
    }
  }

  revalidatePath('/account/orders');
  // Placing an order took stock, so the cached shop pages should show the new figures.
  refreshCatalog();

  // The order is saved and its stock held; now open the payment page for it. If
  // that fails the order stays (unpaid) and the buyer retries from their order page, so
  // they never have to place it twice.
  const payment = await openPaymentPage(orderId, user.id);
  if (!payment.ok) return { orderId, paymentError: payment.error };
  return { orderId, checkoutUrl: payment.checkoutUrl };
}
