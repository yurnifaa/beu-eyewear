import CategoryForm from '@/component/admin/CategoryForm';
import DeleteCategoryButton from '@/component/admin/DeleteCategoryButton';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { createCategory, createSubcategory, updateCategory, updateSubcategory, deleteCategory, deleteSubcategory } from './actions';

export const dynamic = 'force-dynamic';

const Hidden = () => <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">Hidden</span>;

export default async function CategoriesPage() {
  await requireAdmin();
  // The admin sees hidden categories too, so they can be switched back on.
  const [categories, subcategories] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ displayOrder: 'asc' }, { slug: 'asc' }] }),
    prisma.subcategory.findMany({ orderBy: [{ displayOrder: 'asc' }, { slug: 'asc' }] }),
  ]);
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">The shop shows categories and subcategories by display order, lowest first. Hidden ones disappear from the shop along with their products.</p>
      </div>
      <div className="flex flex-col gap-4">
        {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet. Add your first one below.</p>}
        {categories.map((category) => (
          <div key={category.slug} className="rounded-xl border border-border bg-background p-5">
            <p className="font-bold">{category.name} <span className="font-normal text-muted-foreground">({category.slug}) · #{category.displayOrder}</span>{!category.isActive && <Hidden />}</p>
            <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
            <div className="mt-3 flex flex-wrap items-start gap-3">
              <details className="min-w-0 flex-1">
                <summary className="cursor-pointer text-sm font-semibold">Edit category</summary>
                <div className="mt-3 max-w-xl"><CategoryForm kind="category" defaults={category} action={updateCategory.bind(null, category.slug)} /></div>
              </details>
              <DeleteCategoryButton name={category.name} action={deleteCategory.bind(null, category.slug)} />
            </div>
            <ul className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
              {subcategories.filter((sub) => sub.categorySlug === category.slug).map((sub) => (
                <li key={sub.slug} className="flex flex-wrap items-start gap-3">
                  <details className="min-w-0 flex-1">
                    <summary className="cursor-pointer text-sm"><span className="rounded-full bg-muted px-3 py-1 text-xs">{sub.name}</span> <span className="text-xs text-muted-foreground">({sub.slug}) · #{sub.displayOrder} · Edit</span>{!sub.isActive && <Hidden />}</summary>
                    <div className="mt-3 max-w-xl"><CategoryForm kind="subcategory" defaults={sub} action={updateSubcategory.bind(null, sub.slug)} /></div>
                  </details>
                  <DeleteCategoryButton name={sub.name} action={deleteSubcategory.bind(null, sub.slug)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
          <p className="font-semibold">Add Category</p>
          <CategoryForm kind="category" action={createCategory} />
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border p-5">
          <p className="font-semibold">Add Subcategory</p>
          <CategoryForm kind="subcategory" categories={categories} action={createSubcategory} />
        </div>
      </div>
    </div>
  );
}
