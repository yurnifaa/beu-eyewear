'use client';

import { useActionState } from 'react';
import { Lock } from 'lucide-react';
import AuthHeading from '@/component/auth/AuthHeading';
import { authPrimaryClass } from '@/component/auth/auth-classes';
import IconField from '@/component/IconField';
import { resetPassword } from '@/lib/auth/account-actions';
import type { FormState } from '@/lib/auth/types';

const initialState: FormState = {};

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword, initialState);

  return (
    <div>
      <AuthHeading
        eyebrow="Almost there"
        title="New password"
        glyph="shoot"
        description="Choose something at least 8 characters long. You'll be signed out of all your devices."
      />

      <form action={formAction} className="mt-6 flex flex-col">
        <input type="hidden" name="token" value={token} />

        <div className="flex flex-col gap-3">
          <IconField
            id="newPassword"
            type="password"
            placeholder="New Password"
            autoComplete="new-password"
            minLength={8}
            icon={<Lock size={16} aria-hidden="true" />}
            error={state.fieldErrors?.newPassword}
          />
          <IconField
            id="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            autoComplete="new-password"
            minLength={8}
            icon={<Lock size={16} aria-hidden="true" />}
            error={state.fieldErrors?.confirmPassword}
          />
        </div>

        <p aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-red-500">
          {state.error}
        </p>

        <button type="submit" disabled={pending} className={`mt-2 ${authPrimaryClass}`}>
          {pending ? 'Saving...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
