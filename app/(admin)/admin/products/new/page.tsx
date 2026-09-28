import ProductForm from '@/component/admin/ProductForm';
import { getAllSubcategories, getCategories } from '@/lib/catalog/queries';
import { createProduct } from '../actions';

// Admin data must always be fresh — never a static build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const [categories, subcategories] = await Promise.all([getCategories(), getAllSubcategories()]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <ProductForm action={createProduct} categories={categories} subcategories={subcategories} submitLabel="Create Product" />
    </div>
  );
}
