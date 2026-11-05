'use client';

import { useActionState } from 'react';
import { buttonClassName } from '@/component/Button';
import type { FormState } from '@/lib/auth/types';

// payMyOrder, already bound to the order id. On success it never returns: it sends the
// browser to the payment page. It only comes back with an error to show.
export default function PayNowButton({ action }: { action: () => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(async () => action(), {} as FormState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div>
        <button type="submit" disabled={pending} className={buttonClassName({ variant: 'primary' })}>
          {pending ? 'Opening payment page…' : 'Pay now'}
        </button>
      </div>
      <div aria-live="polite" className="min-h-5 text-sm">
        {state.error && <p className="text-red-500">{state.error}</p>}
      </div>
    </form>
  );
}
