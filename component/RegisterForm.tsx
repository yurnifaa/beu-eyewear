'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { buttonClassName } from '@/component/Button';
import TextField from '@/component/FormField';
import { register } from '@/lib/auth/actions';
import type { FormState } from '@/lib/auth/types';

const initialState: FormState = {};

export default function RegisterForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <TextField id="name" label="Full Name" autoComplete="name" required errors={state.fieldErrors?.name} />
      <TextField id="email" label="Email" type="email" autoComplete="email" required errors={state.fieldErrors?.email} />
      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        errors={state.fieldErrors?.password}
      />

      <p aria-live="polite" className="min-h-5 text-sm text-red-500">
        {state.error}
      </p>

      <button type="submit" disabled={pending} className={buttonClassName({ variant: 'primary', className: 'w-full uppercase' })}>
        {pending ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="text-foreground underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
