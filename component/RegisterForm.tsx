'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Lock, Mail, User } from 'lucide-react';
import AuthHeading from '@/component/auth/AuthHeading';
import { authPrimaryClass } from '@/component/auth/auth-classes';
import IconField from '@/component/IconField';
import { register } from '@/lib/auth/actions';
import type { FormState } from '@/lib/auth/types';

const initialState: FormState = {};

export default function RegisterForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div>
      <AuthHeading
        eyebrow="New here"
        title="Create account"
        glyph="star5"
        description="Sign up to check out faster and track your orders."
      />

      <form action={formAction} className="mt-6 flex flex-col">
        {next && <input type="hidden" name="next" value={next} />}

        <div className="flex flex-col gap-3">
          <IconField
            id="name"
            type="text"
            placeholder="Full Name"
            autoComplete="name"
            icon={<User size={16} aria-hidden="true" />}
            error={state.fieldErrors?.name}
          />
          <IconField
            id="email"
            type="email"
            placeholder="Email Address"
            autoComplete="email"
            icon={<Mail size={16} aria-hidden="true" />}
            error={state.fieldErrors?.email}
          />
          <IconField
            id="password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            minLength={8}
            icon={<Lock size={16} aria-hidden="true" />}
            error={state.fieldErrors?.password}
          />
        </div>

        <p aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-red-500">
          {state.error}
        </p>

        <button type="submit" disabled={pending} className={`mt-2 ${authPrimaryClass}`}>
          {pending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="font-semibold text-accent underline underline-offset-4"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
