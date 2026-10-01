'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import TextField from '@/component/FormField';
import { login } from '@/lib/auth/actions';
import type { FormState } from '@/lib/auth/types';

const initialState: FormState = {};

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <TextField id="email" label="Email" type="email" autoComplete="email" required errors={state.fieldErrors?.email} />
      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        errors={state.fieldErrors?.password}
      />

      <p aria-live="polite" className="min-h-5 text-sm text-red-500">
        {state.error}
      </p>

      <button type="submit" disabled={pending} className={buttonClassName({ variant: 'primary', className: 'w-full uppercase' })}>
        {pending ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
          className="text-foreground underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
