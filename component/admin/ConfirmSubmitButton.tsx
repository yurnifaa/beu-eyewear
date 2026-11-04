'use client';

import { buttonClassName } from '@/component/Button';

// A button that submits its own form, after the admin confirms. For one-click actions
// that can't be undone, such as deleting a review.
export default function ConfirmSubmitButton({
  action,
  label,
  message,
  danger = false,
}: {
  // A server action already bound to what it acts on.
  action: () => void | Promise<void>;
  label: string;
  message: string;
  danger?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <button type="submit" className={buttonClassName({ variant: 'secondary', size: 'sm', className: danger ? 'text-red-600' : '' })}>
        {label}
      </button>
    </form>
  );
}
