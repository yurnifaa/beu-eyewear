'use client';
// LEGACY-CATALOG-ADMIN: edits the Prisma catalog, which the storefront no longer reads (see docs/google-sheets-catalog.md).

import { buttonClassName } from '@/component/Button';

export interface DeleteProductButtonProps {
  // deleteProduct already bound to the product's slug.
  action: () => void | Promise<void>;
  productName: string;
  size?: 'sm' | 'md';
}

export default function DeleteProductButton({ action, productName, size = 'md' }: DeleteProductButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed = window.confirm(`Delete “${productName}”? This permanently removes the product and its photo.`);
        if (!confirmed) event.preventDefault();
      }}
    >
      <button type="submit" className={buttonClassName({ variant: 'secondary', size, className: 'text-red-600' })}>
        Delete
      </button>
    </form>
  );
}
