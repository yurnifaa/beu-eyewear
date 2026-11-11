import type { Metadata } from 'next';
import Link from 'next/link';
import ResetPasswordForm from '@/component/ResetPasswordForm';
import AuthHeading from '@/component/auth/AuthHeading';
import { authPrimaryClass } from '@/component/auth/auth-classes';
import AuthShell from '@/component/auth/AuthShell';
import Reveal from '@/component/Reveal';
import { isTokenUsable } from '@/lib/auth/tokens';

export const metadata: Metadata = { title: 'Reset Password' };

export default async function ResetPasswordPage(props: PageProps<'/reset-password'>) {
  const { token } = await props.searchParams;
  const rawToken = typeof token === 'string' ? token : '';
  const valid = await isTokenUsable(rawToken, 'PASSWORD_RESET');

  return (
    <AuthShell>
      <Reveal mode="mount">
        {valid ? (
          <ResetPasswordForm token={rawToken} />
        ) : (
          <>
            <AuthHeading eyebrow="Oops" title="Link expired" glyph="skull" description="Reset links expire after an hour and only work once. Request a new one to continue." />
            <Link href="/forgot-password" className={`mt-8 ${authPrimaryClass}`}>
              Request a new link
            </Link>
          </>
        )}
      </Reveal>
    </AuthShell>
  );
}
