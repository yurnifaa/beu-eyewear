'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/session';
import { findVariant, getProductsBySlugs, getShippingMethods } from '@/lib/catalog/queries';
import { readFreshStock, recordInventoryMovements, type InventoryMovement } from '@/lib/catalog/stock';
import { MAX_SAVED_ADDRESSES } from '@/lib/checkout/address';
import { calcTotals } from '@/lib/checkout/pricing';
import type { PlaceOrderState } from '@/lib/checkout/types';
import { formatOrderNumber } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { isStockWriteEnabled } from '@/lib/sheets/config';
import { checkoutSchema } from '@/lib/validation/checkout';

// Thrown inside the order transaction so the order and its stock rows roll back together.
class OutOfStockError extends Error {
  constructor(
    readonly productName: string,
    readonly available: number,
  ) {
    super(`${productName} is out of stock`);
  }
}

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
  });
  if (!parsed.success) {
    return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { lines, shippingMethod, paymentMethod, ...address } = parsed.data;

  // The client only says *what* to buy. Names, prices and which colors exist all come
  // from the catalog sheet, read here on the server.
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

  // Early, friendly check against the stock the storefront just showed. When the sheet can
  // be written, the authoritative check runs again inside the transaction.
  for (const { name, quantity, available } of demand.values()) {
    if (available < quantity) return { values, error: stockMessage(name, available) };
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingFee = (await getShippingMethods()).find((method) => method.id === shippingMethod)?.fee;
  const totals = calcTotals(subtotal, shippingMethod, shippingFee);

  // With the service account configured, every sale is written back to the sheet's
  // inventory_log, so the sheet and the storefront never disagree. If that write fails the
  // whole transaction rolls back and no order exists.
  const writeBack = isStockWriteEnabled();

  let orderId: string;
  try {
    const order = await prisma.$transaction(
      async (tx) => {
        if (writeBack) {
          // Two buyers going for the last unit queue up here, per SKU and in a fixed order
          // so they can't deadlock; the second one then reads the already reduced stock.
          for (const sku of [...demand.keys()].sort()) {
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${sku}, 0))`;
          }
          const fresh = await readFreshStock();
          for (const [sku, { name, quantity }] of demand) {
            const available = fresh.get(sku) ?? 0;
            if (available < quantity) throw new OutOfStockError(name, available);
          }
        }

        const created = await tx.order.create({
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
          select: { id: true, number: true },
        });

        if (writeBack) {
          const movements: InventoryMovement[] = [...demand].map(([sku, { quantity }]) => ({ sku, type: 'SALE', quantity }));
          await recordInventoryMovements(
            movements,
            formatOrderNumber(created.number).replace('#', ''),
            `App order ${formatOrderNumber(created.number)}`,
          );
        }
        return created;
      },
      // The sheet is called from inside the transaction, so allow for its latency.
      { maxWait: 10_000, timeout: 30_000 },
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
  return { orderId };
}
