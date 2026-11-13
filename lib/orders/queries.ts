import 'server-only';

import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type OrderDetail = Prisma.OrderGetPayload<{ include: { items: true } }>;

// Only what the list cards need. Newest first.
export async function getOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      number: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      total: true,
      items: { orderBy: { id: 'asc' }, select: { id: true, name: true, color: true, quantity: true } },
    },
  });
}

// Scoped to the user, so asking for someone else's order id just returns null.
export async function getOrderForUser(userId: string, id: string): Promise<OrderDetail | null> {
  return prisma.order.findFirst({
    where: { id, userId },
    include: { items: { orderBy: { id: 'asc' } } },
  });
}

// A photo for each order item, keyed by the order item's id. OrderItem is a snapshot (name, color,
// price) with no link to the catalog, so the photo is looked up from the product's colors as they are
// now. Order of preference: the color that was ordered, then the product's default color, then any
// color that has a photo. An item with no photo anywhere (or whose product was deleted) is simply left
// out, and the caller shows a placeholder. A color that has since been switched off still counts, so
// old orders keep their picture.
export async function getOrderItemImages(
  items: { id: string; productSlug: string; color: string | null }[],
): Promise<Record<string, string>> {
  const slugs = [...new Set(items.map((item) => item.productSlug))];
  if (slugs.length === 0) return {};

  const variants = await prisma.productVariant.findMany({
    where: { productSlug: { in: slugs } },
    select: { productSlug: true, color: true, isDefault: true, imageUrls: true },
    orderBy: [{ sortOrder: 'asc' }, { sku: 'asc' }],
  });

  const images: Record<string, string> = {};
  for (const item of items) {
    const own = variants.filter((variant) => variant.productSlug === item.productSlug && variant.imageUrls.length > 0);
    // A color of null means the single "Standard" option (same rule as returnOrderItemsToStock).
    const ordered = own.find((variant) => variant.color === (item.color ?? 'Standard'));
    const photo = (ordered ?? own.find((variant) => variant.isDefault) ?? own[0])?.imageUrls[0];
    if (photo) images[item.id] = photo;
  }
  return images;
}

// The same lookup, shared by everything in one page render (a page and its generateMetadata both
// need the order). Only for reads that just display it. Code that re-reads an order after changing
// it, such as the payment sync on the order pages, must call getOrderForUser so it sees the update.
export const getOrderForUserOnce = cache(getOrderForUser);
