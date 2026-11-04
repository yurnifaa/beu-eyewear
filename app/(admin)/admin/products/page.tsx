import Image from 'next/image';
import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import DeleteProductButton from '@/component/admin/DeleteProductButton';
import InventoryStockBadge from '@/component/admin/InventoryStockBadge';
import Pagination from '@/component/admin/Pagination';
import { getAdminProducts, parseProductFilters } from '@/lib/admin/products';
import { getStoreSettings } from '@/lib/catalog/queries';
import { formatPrice } from '@/lib/format';
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUSES, PRODUCT_TYPE_LABELS, PRODUCT_TYPES } from '@/lib/validation/product';
import { prisma } from '@/lib/prisma';
import { deleteProduct } from './actions';

// Admin data must always be fresh — never a static build-time snapshot.
export const dynamic = 'force-dynamic';

const filterClassName = 'rounded-lg border border-border bg-background px-3 py-2 text-sm';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-700',
  DRAFT: 'bg-amber-500/15 text-amber-700',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

export default async function ProductsPage(props: PageProps<'/admin/products'>) {
  const filters = parseProductFilters(await props.searchParams);
  // The shop hides inactive categories; the admin still needs to filter by them.
  const [{ products, filteredCount, totalCount, page, totalPages }, settings, categories] = await Promise.all([
    getAdminProducts(filters),
    getStoreSettings(),
    prisma.category.findMany({ orderBy: [{ displayOrder: 'asc' }, { slug: 'asc' }], select: { slug: true, name: true } }),
  ]);
  const isFiltered = Boolean(filters.q || filters.category || filters.status || filters.type);
  const params: Record<string, string> = {
    ...(filters.q && { q: filters.q }),
    ...(filters.category && { category: filters.category }),
    ...(filters.status && { status: filters.status }),
    ...(filters.type && { type: filters.type }),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className={buttonClassName({ variant: 'primary', className: 'uppercase' })}>
          Add Product
        </Link>
      </div>

      {/* Plain GET form: filters live in the URL, so they survive refresh and can be shared. */}
      <form className="flex flex-wrap items-center gap-3">
        <input type="search" name="q" defaultValue={filters.q} placeholder="Search by name, slug or SKU" aria-label="Search products" className={`${filterClassName} w-64`} />
        <select name="category" defaultValue={filters.category} aria-label="Filter by category" className={filterClassName}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={filters.type} aria-label="Filter by type" className={filterClassName}>
          <option value="">All types</option>
          {PRODUCT_TYPES.map((type) => (
            <option key={type} value={type}>
              {PRODUCT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={filters.status} aria-label="Filter by status" className={filterClassName}>
          <option value="">All statuses</option>
          {PRODUCT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PRODUCT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <button type="submit" className={buttonClassName({ variant: 'secondary' })}>
          Filter
        </button>
        {isFiltered && (
          <Link href="/admin/products" className="text-sm text-muted-foreground underline hover:text-foreground">
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-semibold">Photo</th>
              <th scope="col" className="px-4 py-3 font-semibold">Name</th>
              <th scope="col" className="px-4 py-3 font-semibold">Category</th>
              <th scope="col" className="px-4 py-3 font-semibold">Price</th>
              <th scope="col" className="px-4 py-3 font-semibold">Colors</th>
              <th scope="col" className="px-4 py-3 font-semibold">Stock</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <div className="relative h-14 w-11 overflow-hidden rounded-md border border-border bg-card">
                    {product.imageUrl && <Image src={product.imageUrl} alt={product.name} fill sizes="44px" className="object-cover" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{product.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{product.slug}</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${STATUS_STYLES[product.status]}`}>{product.status === 'ACTIVE' ? 'Active' : product.status === 'DRAFT' ? 'Draft' : 'Archived'}</span>
                    <span>{PRODUCT_TYPE_LABELS[product.productType]}</span>
                  </p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <p>{product.categoryName}</p>
                  <p className="mt-0.5 text-xs">{product.subcategoryName}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {product.salePrice !== null && product.salePrice < product.listPrice ? (
                    <>
                      <span className="font-medium">{formatPrice(product.salePrice)}</span>{' '}
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(product.listPrice)}</span>
                    </>
                  ) : (
                    formatPrice(product.listPrice)
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums">{product.colors}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {product.colors === 0 ? <span className="text-muted-foreground">No colors</span> : <InventoryStockBadge quantity={product.stock} threshold={settings.lowStockThreshold} />}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/products/${product.slug}`} className="underline hover:text-foreground">
                      Edit
                    </Link>
                    <DeleteProductButton action={deleteProduct.bind(null, product.slug)} productName={product.name} size="sm" />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {isFiltered ? 'No products match your filters.' : 'No products yet. Add your first one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{isFiltered ? `${filteredCount} of ${totalCount} products.` : `${totalCount} products.`}</p>
        <Pagination basePath="/admin/products" params={params} page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
