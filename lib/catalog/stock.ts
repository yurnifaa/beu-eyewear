import 'server-only';

import { cached, invalidate } from '@/lib/sheets/cache';
import { isStockWriteEnabled, stockCacheMs } from '@/lib/sheets/config';
import { appendSheetRows, readSheetRange, type SheetCell } from '@/lib/sheets/google-api';

// Live stock lives in the sheet: `inventory` shows the quantities the formulas calculate
// from `inventory_log`. The storefront reads `inventory` through the authenticated API
// (the published CSV can lag by minutes) and records every sale or return by appending
// a row to `inventory_log`, which the formulas then pick up.

const INVENTORY_RANGE = 'inventory!A:Z';
const LOG_TAB = 'inventory_log';

function rowsToObjects(values: SheetCell[][]) {
  const [header, ...body] = values;
  if (!header) return [];
  const names = header.map((cell) => String(cell ?? '').trim());
  return body
    .filter((row) => row.some((cell) => cell !== null && cell !== ''))
    .map((row) => Object.fromEntries(names.map((name, index) => [name, row[index] ?? null])) as Record<string, SheetCell>);
}

async function readInventory(): Promise<Map<string, number>> {
  const stock = new Map<string, number>();
  for (const row of rowsToObjects(await readSheetRange(INVENTORY_RANGE))) {
    const sku = typeof row.sku === 'string' ? row.sku.trim() : '';
    const available = Number(row.qty_available);
    if (sku && Number.isFinite(available)) stock.set(sku, Math.max(0, Math.floor(available)));
  }
  return stock;
}

// sku -> units available, a few seconds old at most. Undefined when the service account
// isn't configured (callers then fall back to the CSV copy of the inventory tab).
export async function getLiveStock(): Promise<Map<string, number> | undefined> {
  if (!isStockWriteEnabled()) return undefined;
  try {
    return await cached('stock:live', stockCacheMs(), readInventory);
  } catch (error) {
    console.warn('[stock] live stock unavailable, using the published copy:', error instanceof Error ? error.message : 'unknown');
    return undefined;
  }
}

// Straight from the sheet, never cached: checkout validates against this.
export function readFreshStock(): Promise<Map<string, number>> {
  return readInventory();
}

export interface InventoryMovement {
  sku: string;
  type: 'SALE' | 'RETURN';
  // Always positive; the sign is applied from the type.
  quantity: number;
}

function manilaTimestamp(date = new Date()) {
  // sv-SE formats as "2026-10-24 09:30:00".
  return date.toLocaleString('sv-SE', { timeZone: 'Asia/Manila' });
}

// Appends one inventory_log row per movement, then drops the stock cache so the next
// read shows the change. Throws if the sheet can't be written; callers decide whether
// that should abort the order.
export async function recordInventoryMovements(movements: InventoryMovement[], reference: string, reason: string) {
  if (movements.length === 0) return;

  const header = await cached('stock:log-header', 60 * 60 * 1000, async () => {
    const [names] = await readSheetRange(`${LOG_TAB}!1:1`);
    return (names ?? []).map((cell) => String(cell ?? '').trim());
  });
  const required = ['log_id', 'sku', 'movement_type', 'qty_change', 'reason', 'reference_id', 'performed_by_role', 'created_at'];
  if (required.some((name) => !header.includes(name))) {
    invalidate('stock:log-header');
    throw new Error('inventory_log is missing expected columns');
  }

  const now = manilaTimestamp();
  const tag = reference.replace(/[^A-Za-z0-9]/g, '');
  const rows = movements.map((movement, index): SheetCell[] => {
    const values: Record<string, SheetCell> = {
      log_id: `LOG-APP-${movement.type === 'SALE' ? 'S' : 'R'}-${tag}-${index + 1}`,
      sku: movement.sku,
      movement_type: movement.type,
      qty_change: movement.type === 'SALE' ? -movement.quantity : movement.quantity,
      reason,
      reference_id: reference,
      performed_by_role: 'SYSTEM',
      created_at: now,
    };
    return header.map((name) => values[name] ?? null);
  });

  await appendSheetRows(LOG_TAB, rows);
  invalidate('stock:live');
}
