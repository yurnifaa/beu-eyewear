import 'server-only';

import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { getStoreSettings } from '@/lib/catalog/queries';
import { prisma } from '@/lib/prisma';
import { MAX_STOCK } from './config';

export const INVENTORY_PAGE_SIZE = 30;

export interface StockFormState {
  error?: string;
  message?: string;
  values?: { mode: string; amount: string };
}

export const stockAdjustmentSchema = z
  .object({
    sku: z.string().trim().min(1).max(40),
    mode: z.enum(['set', 'delta']),
    amount: z
      .string()
      .trim()
      .regex(/^[+-]?\d+$/, 'Enter a whole number, such as 10 or -2.')
      .transform(Number)
      .pipe(z.number().int().min(-MAX_STOCK).max(MAX_STOCK)),
    reason: z.string().trim().max(120).transform((value) => value || null),
  })
  .refine((data) => data.mode !== 'set' || data.amount >= 0, {
    message: 'Stock must be between 0 and 100,000.',
    path: ['amount'],
  });

export type InventoryFilter = 'all' | 'low' | 'out';

export function parseInventoryFilters(params: Record<string, string | string[] | undefined>) {
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 120) : '';
  const filter: InventoryFilter = params.filter === 'low' || params.filter === 'out' ? params.filter : 'all';
  const page = Number(typeof params.page === 'string' ? params.page : 1);
  return { q, filter, page: Number.isInteger(page) && page > 0 ? page : 1 };
}

// One row per SKU (per color), since stock is tracked per SKU.
export async function getInventory({ q, filter, page }: { q: string; filter: InventoryFilter; page: number }) {
  const { lowStockThreshold: threshold } = await getStoreSettings();
  const where: Prisma.ProductVariantWhereInput = {
    ...(q && {
      OR: [
        { sku: { contains: q, mode: 'insensitive' } },
        { color: { contains: q, mode: 'insensitive' } },
        { product: { name: { contains: q, mode: 'insensitive' } } },
        { product: { slug: { contains: q, mode: 'insensitive' } } },
      ],
    }),
    ...(filter === 'low' && { stockQuantity: { gt: 0, lte: threshold } }),
    ...(filter === 'out' && { stockQuantity: { lte: 0 } }),
  };

  const total = await prisma.productVariant.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / INVENTORY_PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = await prisma.productVariant.findMany({
    where,
    orderBy: [{ product: { name: 'asc' } }, { sortOrder: 'asc' }, { sku: 'asc' }],
    skip: (current - 1) * INVENTORY_PAGE_SIZE,
    take: INVENTORY_PAGE_SIZE,
    select: {
      sku: true,
      color: true,
      stockQuantity: true,
      isActive: true,
      product: { select: { slug: true, name: true, status: true, category: { select: { name: true } }, subcategory: { select: { name: true } } } },
    },
  });
  return { rows, total, page: current, totalPages, threshold };
}

export type AdjustResult = { ok: true; after: number } | { ok: false; reason: 'missing' | 'range' };

// The SKU's row is locked while it is read and changed, so a sale or another admin
// landing at the same moment waits its turn instead of being overwritten.
export async function applyStockAdjustment(
  data: z.infer<typeof stockAdjustmentSchema>,
  actorId: string,
): Promise<AdjustResult> {
  const { sku, mode, amount, reason } = data;
  return prisma.$transaction(
    async (tx): Promise<AdjustResult> => {
      const rows = await tx.$queryRaw<{ stockQuantity: number }[]>`SELECT "stockQuantity" FROM "ProductVariant" WHERE "sku" = ${sku} FOR UPDATE`;
      const current = rows[0]?.stockQuantity;
      if (current === undefined) return { ok: false, reason: 'missing' };

      const target = mode === 'set' ? amount : current + amount;
      if (target < 0 || target > MAX_STOCK) return { ok: false, reason: 'range' };
      const change = target - current;
      if (change === 0) return { ok: true, after: target };

      await tx.productVariant.update({ where: { sku }, data: { stockQuantity: target } });
      await tx.stockMovement.create({
        data: {
          sku,
          // Adding units is a delivery; everything else is a correction.
          type: mode === 'delta' && change > 0 ? 'RECEIVE' : 'ADJUSTMENT',
          quantityChange: change,
          stockAfter: target,
          reason: reason ?? (mode === 'set' ? 'Stock count' : change > 0 ? 'Stock received' : 'Manual adjustment'),
          actorId,
        },
      });
      return { ok: true, after: target };
    },
    { maxWait: 10_000, timeout: 20_000 },
  );
}

export async function getRecentMovements(limit = 15) {
  const movements = await prisma.stockMovement.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: limit });
  const skus = [...new Set(movements.map((movement) => movement.sku))];
  const actorIds = [...new Set(movements.map((movement) => movement.actorId).filter((id): id is string => Boolean(id)))];
  const [variants, actors] = await Promise.all([
    prisma.productVariant.findMany({ where: { sku: { in: skus } }, select: { sku: true, color: true, product: { select: { name: true } } } }),
    prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true } }),
  ]);
  const variantBySku = new Map(variants.map((variant) => [variant.sku, variant]));
  const actorById = new Map(actors.map((actor) => [actor.id, actor.name]));
  return movements.map((movement) => ({
    ...movement,
    productName: variantBySku.get(movement.sku)?.product.name ?? null,
    color: variantBySku.get(movement.sku)?.color ?? null,
    actorName: movement.actorId ? (actorById.get(movement.actorId) ?? 'Admin') : 'System',
  }));
}
