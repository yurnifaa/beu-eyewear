'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import AuthHeading from '@/component/auth/AuthHeading';
import { authPrimaryClass } from '@/component/auth/auth-classes';
import IconField from '@/component/IconField';
import { requestPasswordReset } from '@/lib/auth/account-actions';
import type { FormState } from '@/lib/auth/types';
import { useFormValidation } from '@/lib/use-form-validation';
import { forgotPasswordSchema } from '@/lib/validation/auth';

const initialState: FormState = {};

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);
  const { errors, formProps } = useFormValidation(forgotPasswordSchema);

  return (
    <div>
      <AuthHeading
        eyebrow="Locked out"
        title="Forgot password?"
        glyph="orbit"
        description="Enter your email and we'll send you a link to choose a new one."
      />

      <form action={formAction} {...formProps} className="mt-6 flex flex-col">
        <IconField
          id="email"
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          icon={<Mail size={16} aria-hidden="true" />}
          error={errors.email ?? state.fieldErrors?.email}
        />

        <p
          aria-live="polite"
          className={`mt-3 min-h-5 text-center text-xs ${state.error ? 'text-red-500' : 'text-green-700'}`}
        >
          {state.error ?? state.success}
        </p>

        <button type="submit" disabled={pending} className={`mt-2 ${authPrimaryClass}`}>
          {pending ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-accent underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
