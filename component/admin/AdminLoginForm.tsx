'use client';

import { useActionState, useId } from 'react';
import { buttonClassName } from '@/component/Button';
import { adminLogin } from '@/lib/auth/admin-actions';
import type { FormState } from '@/lib/auth/types';

const initialState: FormState = {};

const fieldClassName = 'mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm';

const firstError = (errors?: string[]) => errors?.[0];

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);
  const id = useId();
  const emailError = firstError(state.fieldErrors?.email);
  const passwordError = firstError(state.fieldErrors?.password);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="text-sm font-semibold" htmlFor={`${id}-email`}>
        Email
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={emailError ? true : undefined}
          aria-describedby={emailError ? `${id}-email-error` : undefined}
          className={fieldClassName}
        />
        {emailError && (
          <span id={`${id}-email-error`} className="mt-1 block text-xs font-normal text-red-600">
            {emailError}
          </span>
        )}
      </label>

      <label className="text-sm font-semibold" htmlFor={`${id}-password`}>
        Password
        <input
          id={`${id}-password`}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordError ? `${id}-password-error` : undefined}
          className={fieldClassName}
        />
        {passwordError && (
          <span id={`${id}-password-error`} className="mt-1 block text-xs font-normal text-red-600">
            {passwordError}
          </span>
        )}
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClassName({ className: 'w-full uppercase' })}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
