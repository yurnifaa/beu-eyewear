import { notFound } from 'next/navigation';
import DeleteProductButton from '@/component/admin/DeleteProductButton';
import ProductForm from '@/component/admin/ProductForm';
import { getAllSubcategories, getCategories, getProductBySlug } from '@/lib/catalog/queries';
import { deleteProduct, updateProduct } from '../actions';

// Admin data must always be fresh — never a static build-time snapshot.
export const dynamic = 'force-dynamic';

export default async function EditProductPage(props: PageProps<'/admin/products/[id]'>) {
  const { id } = await props.params;
  const [product, categories, subcategories] = await Promise.all([
    getProductBySlug(id),
    getCategories(),
    getAllSubcategories(),
  ]);

  if (!product) {
    notFound();
  }

  const updateWithSlug = updateProduct.bind(null, product.slug);
  const deleteWithSlug = deleteProduct.bind(null, product.slug);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <DeleteProductButton action={deleteWithSlug} productName={product.name} />
      </div>
      <ProductForm
        action={updateWithSlug}
        categories={categories}
        subcategories={subcategories}
        defaultValues={product}
        submitLabel="Save Changes"
      />
    </div>
  );
}
