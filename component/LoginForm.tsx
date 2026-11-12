'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import AuthHeading from '@/component/auth/AuthHeading';
import { authPrimaryClass, authSecondaryClass } from '@/component/auth/auth-classes';
import IconField from '@/component/IconField';
import { login } from '@/lib/auth/actions';
import type { FormState } from '@/lib/auth/types';
import { useFormValidation } from '@/lib/use-form-validation';
import { loginSchema } from '@/lib/validation/auth';

const initialState: FormState = {};

const firstError = (errors?: string | string[]) => (Array.isArray(errors) ? errors[0] : errors);

type LoginFormProps = {
  next?: string;
  /** Modal usage: called when leaving via a link (Sign Up) so the modal can close. */
  onNavigate?: () => void;
  /** Modal usage: turns "Continue as Guest" into a button that closes the modal. */
  onGuest?: () => void;
  /** Use h1 when this is the main content of the page (/login). */
  headingAs?: 'h1' | 'h2';
  /** Shown under the heading, e.g. after a password reset. */
  notice?: string;
};

export default function LoginForm({ next, onNavigate, onGuest, headingAs: Heading = 'h2', notice }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const { errors, formProps } = useFormValidation(loginSchema);
  const errorFor = (name: string) => errors[name] ?? firstError(state.fieldErrors?.[name]);

  return (
    <div>
      <AuthHeading
        as={Heading}
        id="login-title"
        eyebrow="Welcome back"
        title="Log in"
        glyph="bolt"
        description="Pick up where you left off: your orders, saved frames and addresses."
      />
      {notice && (
        <p role="status" className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-center text-xs text-green-700">
          {notice}
        </p>
      )}

      <form action={formAction} {...formProps} className="mt-6 flex flex-col">
        {next && <input type="hidden" name="next" value={next} />}

        <div className="flex flex-col gap-3">
          <IconField
            id="email"
            type="email"
            placeholder="Email Address"
            autoComplete="email"
            icon={<Mail size={16} aria-hidden="true" />}
            error={errorFor('email')}
          />
          <IconField
            id="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            icon={<Lock size={16} aria-hidden="true" />}
            error={errorFor('password')}
          />
        </div>

        <div className="mt-2 text-right">
          <Link href="/forgot-password" onClick={onNavigate} className="text-[11px] font-medium text-accent underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>

        <p aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-red-500">
          {state.error}
        </p>

        <button type="submit" disabled={pending} className={`mt-2 ${authPrimaryClass}`}>
          {pending ? 'Logging in...' : 'Log in'}
        </button>

        {onGuest ? (
          <button
            type="button"
            onClick={onGuest}
            className={`mt-3 ${authSecondaryClass}`}
          >
            Continue as Guest
          </button>
        ) : (
          <Link
            href="/home"
            className={`mt-3 ${authSecondaryClass}`}
          >
            Continue as Guest
          </Link>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
          onClick={onNavigate}
          className="font-semibold text-accent underline underline-offset-4"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}