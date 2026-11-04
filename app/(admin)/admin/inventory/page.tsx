import Link from 'next/link';
import InventoryStockBadge from '@/component/admin/InventoryStockBadge';
import Pagination from '@/component/admin/Pagination';
import StockAdjustForm from '@/component/admin/StockAdjustForm';
import { requireAdmin } from '@/lib/auth/session';
import { getInventory, getRecentMovements, parseInventoryFilters } from '@/lib/admin/inventory';
import InventoryFilters from './InventoryFilters';
import { adjustStock } from './actions';

export const dynamic = 'force-dynamic';

const MOVEMENT_LABELS = { RECEIVE: 'Received', SALE: 'Sale', RETURN: 'Returned', ADJUSTMENT: 'Adjustment' } as const;

function formatDateTime(date: Date) {
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
}

export default async function InventoryPage(props: PageProps<'/admin/inventory'>) {
  await requireAdmin();
  const { q, filter, page: requestedPage } = parseInventoryFilters(await props.searchParams);
  const [{ rows, total, page, totalPages, threshold }, movements] = await Promise.all([
    getInventory({ q, filter, page: requestedPage }),
    getRecentMovements(15),
  ]);
  const filtered = Boolean(q || filter !== 'all');
  const params: Record<string, string> = { ...(q && { q }), ...(filter !== 'all' && { filter }) };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stock is tracked per color (SKU). Low stock means 1–{threshold} units; change the limit in Settings. Every change is
          recorded below.
        </p>
      </div>
      <InventoryFilters key={`${filter}:${q}`} q={q} filter={filter} />
      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th scope="col" className="px-4 py-3 font-semibold">Product</th>
            <th scope="col" className="px-4 py-3 font-semibold">Color / SKU</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Stock</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Quick adjustment</th>
          </tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku} className="border-b border-border last:border-b-0 align-top">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${row.product.slug}`} className="font-medium underline-offset-2 hover:underline">{row.product.name}</Link>
                  <p className="mt-1 text-xs text-muted-foreground">{row.product.category.name} · {row.product.subcategory.name}{row.product.status !== 'ACTIVE' ? ` · ${row.product.status.toLowerCase()}` : ''}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{row.color}{row.isActive ? '' : ' (inactive)'}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{row.sku}</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{row.stockQuantity.toLocaleString('en-PH')}</td>
                <td className="whitespace-nowrap px-4 py-3"><InventoryStockBadge quantity={row.stockQuantity} threshold={threshold} /></td>
                <td className="px-4 py-3"><StockAdjustForm action={adjustStock.bind(null, row.sku)} quantity={row.stockQuantity} name={`${row.product.name} ${row.color}`} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{filtered ? 'Nothing matches your filters.' : 'No products yet.'}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{total} color{total === 1 ? '' : 's'}{filtered ? ' matching your filters' : ''}.</p>
        <Pagination basePath="/admin/inventory" params={params} page={page} totalPages={totalPages} />
      </div>

      <section aria-labelledby="movements-title" className="rounded-xl border border-border bg-background">
        <h2 id="movements-title" className="p-5 text-sm font-semibold uppercase tracking-wide">Recent stock changes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-y border-border text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-semibold">When</th>
              <th scope="col" className="px-5 py-3 font-semibold">Product / SKU</th>
              <th scope="col" className="px-5 py-3 font-semibold">Type</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Change</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Stock after</th>
              <th scope="col" className="px-5 py-3 font-semibold">Reason</th>
              <th scope="col" className="px-5 py-3 font-semibold">By</th>
            </tr></thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b border-border last:border-b-0">
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{formatDateTime(movement.createdAt)}</td>
                  <td className="px-5 py-3">
                    <p>{movement.productName ? `${movement.productName}${movement.color && movement.color !== 'Standard' ? ` · ${movement.color}` : ''}` : <span className="text-muted-foreground">Deleted item</span>}</p>
                    <p className="font-mono text-xs text-muted-foreground">{movement.sku}</p>
                  </td>
                  <td className="px-5 py-3">{MOVEMENT_LABELS[movement.type]}</td>
                  <td className={`px-5 py-3 text-right tabular-nums ${movement.quantityChange < 0 ? 'text-red-600' : 'text-green-700'}`}>{movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{movement.stockAfter}</td>
                  <td className="px-5 py-3 text-muted-foreground">{movement.reason}{movement.reference ? ` (${movement.reference})` : ''}</td>
                  <td className="px-5 py-3 text-muted-foreground">{movement.actorName}</td>
                </tr>
              ))}
              {movements.length === 0 && <tr><td colSpan={7} className="px-5 py-6 text-center text-muted-foreground">No stock changes yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
