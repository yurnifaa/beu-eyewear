'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import AuthHeading from '@/component/auth/AuthHeading';
import { authPrimaryClass } from '@/component/auth/auth-classes';
import { confirmEmail } from '@/lib/auth/account-actions';
import type { FormState } from '@/lib/auth/types';

const initialState: FormState = {};

// The token is only spent when this form is submitted, not when the page loads,
// so email security scanners that prefetch links can't use it up.
export default function ConfirmEmailForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(confirmEmail, initialState);

  return (
    <div>
      {state.success ? (
        <>
          <AuthHeading eyebrow="All set" title="Email confirmed" glyph="heart" description={state.success} />
          <Link href="/account/profile" className={`mt-8 ${authPrimaryClass}`}>
            Go to your account
          </Link>
        </>
      ) : (
        <>
          <AuthHeading
            eyebrow="One tap left"
            title="Confirm your email"
            glyph="spark"
            description="Press the button to finish confirming your email address."
          />
          <form action={formAction} className="mt-8 flex flex-col">
            <input type="hidden" name="token" value={token} />
            <p aria-live="polite" className="min-h-5 text-center text-xs text-red-500">
              {state.error}
            </p>
            <button type="submit" disabled={pending} className={`mt-2 ${authPrimaryClass}`}>
              {pending ? 'Confirming...' : 'Confirm email'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
