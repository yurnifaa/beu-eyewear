import { redirect } from 'next/navigation';
import ForgotPasswordForm from '@/component/ForgotPasswordForm';
import AuthShell from '@/component/auth/AuthShell';
import Reveal from '@/component/Reveal';
import { getCurrentUser } from '@/lib/auth/session';

export default async function ForgotPasswordPage() {
  // Signed-in users change their password from their profile.
  if (await getCurrentUser()) {
    redirect('/account/profile');
  }

  return (
    <AuthShell>
      <Reveal mode="mount">
        <ForgotPasswordForm />
      </Reveal>
    </AuthShell>
  );
}
