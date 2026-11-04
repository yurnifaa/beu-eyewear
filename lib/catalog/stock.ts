import 'server-only';

import type { Prisma } from '@prisma/client';

// Stock lives on ProductVariant (one row per SKU) and every change is recorded in
// StockMovement. These helpers run inside the caller's transaction, so an order and its
// stock change commit or roll back together.

// Thrown when a SKU doesn't have enough units; the transaction rolls back and the
// shopper is told which product ran short.
export class OutOfStockError extends Error {
  constructor(
    readonly productName: string,
    readonly available: number,
  ) {
    super(`${productName} is out of stock`);
  }
}

export interface StockLine {
  sku: string;
  quantity: number;
  // Only used in the out-of-stock message.
  name: string;
}

// Takes stock for a sale. Each SKU is updated with a single conditional UPDATE, which
// checks the quantity and locks the row at once, so two buyers can never both take the
// last unit. SKUs are processed in a fixed order so concurrent orders can't deadlock.
export async function takeStock(tx: Prisma.TransactionClient, lines: StockLine[], reference: string, reason: string) {
  const movements: Prisma.StockMovementCreateManyInput[] = [];
  for (const line of [...lines].sort((a, b) => a.sku.localeCompare(b.sku))) {
    const { count } = await tx.productVariant.updateMany({
      where: { sku: line.sku, stockQuantity: { gte: line.quantity } },
      data: { stockQuantity: { decrement: line.quantity } },
    });
    if (count === 0) {
      const current = await tx.productVariant.findUnique({ where: { sku: line.sku }, select: { stockQuantity: true } });
      throw new OutOfStockError(line.name, current?.stockQuantity ?? 0);
    }
    const after = await tx.productVariant.findUniqueOrThrow({ where: { sku: line.sku }, select: { stockQuantity: true } });
    movements.push({ sku: line.sku, type: 'SALE', quantityChange: -line.quantity, stockAfter: after.stockQuantity, reason, reference });
  }
  if (movements.length > 0) await tx.stockMovement.createMany({ data: movements });
}

// Puts units back (a cancelled order). A SKU that no longer exists is skipped: the
// product was deleted after the order was placed.
export async function returnStock(
  tx: Prisma.TransactionClient,
  lines: { sku: string; quantity: number }[],
  reference: string,
  reason: string,
) {
  const movements: Prisma.StockMovementCreateManyInput[] = [];
  for (const line of [...lines].sort((a, b) => a.sku.localeCompare(b.sku))) {
    const { count } = await tx.productVariant.updateMany({
      where: { sku: line.sku },
      data: { stockQuantity: { increment: line.quantity } },
    });
    if (count === 0) continue;
    const after = await tx.productVariant.findUniqueOrThrow({ where: { sku: line.sku }, select: { stockQuantity: true } });
    movements.push({ sku: line.sku, type: 'RETURN', quantityChange: line.quantity, stockAfter: after.stockQuantity, reason, reference });
  }
  if (movements.length > 0) await tx.stockMovement.createMany({ data: movements });
}

// OrderItem snapshots the product slug and color, not the SKU, so find the SKU again.
// A color of null means the single "Standard" option.
export async function returnOrderItemsToStock(
  tx: Prisma.TransactionClient,
  items: { productSlug: string; color: string | null; quantity: number }[],
  reference: string,
  reason: string,
) {
  if (items.length === 0) return;
  const variants = await tx.productVariant.findMany({
    where: { OR: items.map((item) => ({ productSlug: item.productSlug, color: item.color ?? 'Standard' })) },
    select: { sku: true, productSlug: true, color: true },
  });
  const bySku = new Map<string, number>();
  for (const item of items) {
    const variant = variants.find((candidate) => candidate.productSlug === item.productSlug && candidate.color === (item.color ?? 'Standard'));
    if (variant) bySku.set(variant.sku, (bySku.get(variant.sku) ?? 0) + item.quantity);
  }
  await returnStock(tx, [...bySku].map(([sku, quantity]) => ({ sku, quantity })), reference, reason);
}
