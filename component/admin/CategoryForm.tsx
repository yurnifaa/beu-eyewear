'use client';

import { useActionState, useId } from 'react';
import { buttonClassName } from '@/component/Button';
import type { CategoryFormState } from '@/lib/admin/categories';

interface Defaults {
  name: string;
  slug: string;
  description?: string | null;
  categorySlug?: string;
  imageUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

interface Props {
  action: (previous: CategoryFormState, data: FormData) => Promise<CategoryFormState>;
  kind: 'category' | 'subcategory';
  defaults?: Defaults;
  categories?: { name: string; slug: string }[];
}

const fieldClassName = 'mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm';

type TextKey = 'name' | 'slug' | 'description' | 'categorySlug' | 'imageUrl' | 'displayOrder';

export default function CategoryForm({ action, kind, defaults, categories = [] }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const id = useId();
  const value = (key: TextKey) => state.values?.[key] ?? (defaults?.[key] === undefined || defaults[key] === null ? '' : String(defaults[key]));
  // A new row starts switched on; after a failed save show what was sent.
  const active = state.values ? state.values.isActive === 'on' : (defaults?.isActive ?? true);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      {kind === 'subcategory' && (defaults ? (
        <input type="hidden" name="categorySlug" value={defaults.categorySlug} />
      ) : (
        <label className="text-sm font-semibold" htmlFor={`${id}-parent`}>Category
          <select id={`${id}-parent`} name="categorySlug" required defaultValue={value('categorySlug') || categories[0]?.slug} className={fieldClassName}>
            {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
      ))}
      <label className="text-sm font-semibold" htmlFor={`${id}-name`}>Name
        <input id={`${id}-name`} name="name" required maxLength={120} defaultValue={value('name')} className={fieldClassName} />
      </label>
      <label className="text-sm font-semibold" htmlFor={`${id}-slug`}>Slug
        <input id={`${id}-slug`} name="slug" required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={value('slug')} className={fieldClassName} aria-describedby={defaults ? `${id}-warning` : undefined} />
      </label>
      {defaults && <p id={`${id}-warning`} className="text-xs text-muted-foreground">Changing the slug also changes the shop URLs that use it.</p>}
      <label className="text-sm font-semibold" htmlFor={`${id}-description`}>Description{kind === 'subcategory' ? ' (optional)' : ''}
        <textarea id={`${id}-description`} name="description" rows={2} maxLength={2000} defaultValue={value('description')} className={fieldClassName} />
      </label>
      {kind === 'category' && (
        <label className="text-sm font-semibold" htmlFor={`${id}-image`}>Image (optional)
          <input id={`${id}-image`} name="imageUrl" maxLength={500} defaultValue={value('imageUrl')} placeholder="/categories/premium.jpg" className={fieldClassName} />
        </label>
      )}
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm font-semibold" htmlFor={`${id}-order`}>Display order
          <input id={`${id}-order`} name="displayOrder" required inputMode="numeric" pattern="[0-9]{1,4}" maxLength={4} defaultValue={value('displayOrder') || '99'} className={`${fieldClassName} w-28`} />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={active} /> Shown in the shop
        </label>
      </div>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p role="status" className="text-sm text-muted-foreground">{state.message}</p>}
      <button type="submit" disabled={pending || (kind === 'subcategory' && !defaults && categories.length === 0)} className={buttonClassName({ className: 'self-start uppercase' })}>
        {pending ? 'Saving…' : defaults ? 'Save Changes' : kind === 'category' ? 'Add Category' : 'Add Subcategory'}
      </button>
    </form>
  );
}
