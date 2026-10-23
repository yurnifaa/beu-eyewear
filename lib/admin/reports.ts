import 'server-only';

import { Prisma } from '@prisma/client';
import { getCategories, getProductsBySlugs } from '@/lib/catalog/queries';
import { prisma } from '@/lib/prisma';
import { displaySalesDate, periodDates, type ReportPeriod, type SalesRange } from './dates';

export interface RevenuePeriod { period: string; orders: number; revenue: number; paidRevenue: number }
export interface ProductSales { slug: string; name: string; units: number; revenue: number }
export interface CategorySales { slug: string | null; name: string; units: number; revenue: number; share: number }

export function reportPeriodLabel(date: string, period: ReportPeriod) {
  if (period === 'week') return `Week of ${displaySalesDate(date)}`;
  if (period === 'month') return date.slice(0, 7);
  return displaySalesDate(date);
}

export async function getRevenuePeriods(range: SalesRange): Promise<RevenuePeriod[]> {
  const rows = await prisma.$queryRaw<{ period: string; orders: bigint; revenue: bigint; paidRevenue: bigint }[]>`
    SELECT to_char(date_trunc(${range.period}, ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila'), 'YYYY-MM-DD') AS period,
      COUNT(*)::bigint AS orders,
      COALESCE(SUM(total) FILTER (WHERE status <> 'CANCELLED'), 0)::bigint AS revenue,
      COALESCE(SUM(total) FILTER (WHERE status <> 'CANCELLED' AND "paymentStatus" = 'PAID'), 0)::bigint AS "paidRevenue"
    FROM "Order"
    WHERE "createdAt" >= (${range.start.toISOString()}::timestamptz AT TIME ZONE 'UTC')
      AND "createdAt" < (${range.endExclusive.toISOString()}::timestamptz AT TIME ZONE 'UTC')
    GROUP BY 1 ORDER BY 1
  `;
  const byPeriod = new Map(rows.map((row) => [row.period, row]));
  return periodDates(range).map((period) => ({
    period, orders: Number(byPeriod.get(period)?.orders ?? 0), revenue: Number(byPeriod.get(period)?.revenue ?? 0),
    paidRevenue: Number(byPeriod.get(period)?.paidRevenue ?? 0),
  }));
}

export async function getTopProducts(range: SalesRange, ranking: 'units' | 'revenue'): Promise<ProductSales[]> {
  const ordering = ranking === 'units' ? Prisma.sql`units DESC, revenue DESC` : Prisma.sql`revenue DESC, units DESC`;
  const rows = await prisma.$queryRaw<{ slug: string; name: string; units: bigint; revenue: bigint }[]>`
    SELECT i."productSlug" AS slug, MAX(i.name) AS name,
      SUM(i.quantity)::bigint AS units, SUM(i."unitPrice"::bigint * i.quantity)::bigint AS revenue
    FROM "OrderItem" i JOIN "Order" o ON o.id = i."orderId"
    WHERE o.status <> 'CANCELLED'
      AND o."createdAt" >= (${range.start.toISOString()}::timestamptz AT TIME ZONE 'UTC')
      AND o."createdAt" < (${range.endExclusive.toISOString()}::timestamptz AT TIME ZONE 'UTC')
    GROUP BY i."productSlug" ORDER BY ${ordering}, slug ASC LIMIT 10
  `;
  return rows.map((row) => ({ ...row, units: Number(row.units), revenue: Number(row.revenue) }));
}

export async function getCategorySales(range: SalesRange): Promise<CategorySales[]> {
  const rows = await prisma.$queryRaw<{ slug: string; units: bigint; revenue: bigint }[]>`
    SELECT i."productSlug" AS slug,
      SUM(i.quantity)::bigint AS units, SUM(i."unitPrice"::bigint * i.quantity)::bigint AS revenue
    FROM "OrderItem" i JOIN "Order" o ON o.id = i."orderId"
    WHERE o.status <> 'CANCELLED'
      AND o."createdAt" >= (${range.start.toISOString()}::timestamptz AT TIME ZONE 'UTC')
      AND o."createdAt" < (${range.endExclusive.toISOString()}::timestamptz AT TIME ZONE 'UTC')
    GROUP BY i."productSlug"
  `;

  // Categories come from the catalog sheet. Items whose product is no longer in it
  // are reported as unknown, as deleted products always were.
  let productCategory = new Map<string, string>();
  let categoryNames = new Map<string, string>();
  try {
    const [products, categories] = await Promise.all([getProductsBySlugs(rows.map((row) => row.slug)), getCategories()]);
    productCategory = new Map(products.map((product) => [product.slug, product.categorySlug]));
    categoryNames = new Map(categories.map((category) => [category.slug, category.name]));
  } catch (error) {
    console.error('category report: catalog unavailable', error instanceof Error ? error.message : 'unknown error');
  }

  const grouped = new Map<string | null, { name: string; units: number; revenue: number }>();
  for (const row of rows) {
    const slug = productCategory.get(row.slug) ?? null;
    const entry = grouped.get(slug) ?? { name: slug ? (categoryNames.get(slug) ?? slug) : 'Unknown/deleted product', units: 0, revenue: 0 };
    entry.units += Number(row.units);
    entry.revenue += Number(row.revenue);
    grouped.set(slug, entry);
  }
  const list = [...grouped].map(([slug, entry]) => ({ slug, ...entry }));
  list.sort((a, b) => b.revenue - a.revenue || a.name.localeCompare(b.name));
  const total = list.reduce((sum, row) => sum + row.revenue, 0);
  return list.map((row) => ({ ...row, share: total ? (row.revenue / total) * 100 : 0 }));
}

export async function getReports(range: SalesRange) {
  const [periods, topByUnits, topByRevenue, categories] = await Promise.all([
    getRevenuePeriods(range), getTopProducts(range, 'units'), getTopProducts(range, 'revenue'), getCategorySales(range),
  ]);
  return {
    periods, topByUnits, topByRevenue, categories,
    totalOrders: periods.reduce((sum, row) => sum + row.orders, 0),
    revenue: periods.reduce((sum, row) => sum + row.revenue, 0),
    paidRevenue: periods.reduce((sum, row) => sum + row.paidRevenue, 0),
    itemRevenue: categories.reduce((sum, row) => sum + row.revenue, 0),
    units: categories.reduce((sum, row) => sum + row.units, 0),
  };
}
