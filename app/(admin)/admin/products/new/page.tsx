// LEGACY-CATALOG-ADMIN: edits the Prisma catalog, which the storefront no longer reads (see docs/google-sheets-catalog.md).
import ProductForm from '@/component/admin/ProductForm';
import { getAllSubcategories, getCategories } from '@/lib/catalog/legacy-prisma-queries';
import { createProduct } from '../actions';
import LegacyCatalogNotice from '@/component/admin/LegacyCatalogNotice';

// Admin data must always be fresh — never a static build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const [categories, subcategories] = await Promise.all([getCategories(), getAllSubcategories()]);

  return (
    <div className="flex flex-col gap-6">
      <LegacyCatalogNotice />
      <h1 className="text-2xl font-bold">Add Product</h1>
      <ProductForm action={createProduct} categories={categories} subcategories={subcategories} submitLabel="Create Product" />
    </div>
  );
}
