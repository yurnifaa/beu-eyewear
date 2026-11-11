import type { Metadata } from 'next';
import Link from 'next/link';
import ConfirmEmailForm from '@/component/ConfirmEmailForm';
import AuthHeading from '@/component/auth/AuthHeading';
import { authPrimaryClass } from '@/component/auth/auth-classes';
import AuthShell from '@/component/auth/AuthShell';
import Reveal from '@/component/Reveal';
import { isTokenUsable } from '@/lib/auth/tokens';

export const metadata: Metadata = { title: 'Verify Email' };

export default async function VerifyEmailPage(props: PageProps<'/verify-email'>) {
  const { token } = await props.searchParams;
  const rawToken = typeof token === 'string' ? token : '';
  const valid = await isTokenUsable(rawToken, 'EMAIL_VERIFY');

  return (
    <AuthShell>
      <Reveal mode="mount">
        {valid ? (
          <ConfirmEmailForm token={rawToken} />
        ) : (
          <>
            <AuthHeading eyebrow="Oops" title="Link expired" glyph="skull" description="Confirmation links expire after 24 hours and only work once. Sign in and request a new one from your profile." />
            <Link href="/account/profile" className={`mt-8 ${authPrimaryClass}`}>
              Go to your profile
            </Link>
          </>
        )}
      </Reveal>
    </AuthShell>
  );
}
