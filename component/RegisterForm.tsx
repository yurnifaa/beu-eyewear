'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Lock, Mail, User } from 'lucide-react';
import BrandWordmark from '@/component/BrandWordmark';
import IconField from '@/component/IconField';
import { register } from '@/lib/auth/actions';
import type { FormState } from '@/lib/auth/types';

const initialState: FormState = {};

export default function RegisterForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div>
      <div className="text-center">
        <BrandWordmark />
        <h1 className="mt-6 text-base font-semibold">Create Account</h1>
        <p className="mt-1 text-[11px] text-muted-foreground">Sign up to check out and track your orders.</p>
      </div>

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

        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-11 w-full rounded-full bg-[#8499D9] text-sm font-semibold text-white transition-colors hover:bg-[#6F86CF] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="font-semibold text-[#7B8FD6] hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
