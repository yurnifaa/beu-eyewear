import { redirect } from 'next/navigation';
import LoginForm from '@/component/LoginForm';
import AuthShell from '@/component/auth/AuthShell';
import Reveal from '@/component/Reveal';
import { getCurrentUser, safeNextPath } from '@/lib/auth/session';

export default async function LoginPage(props: PageProps<'/login'>) {
  const { next, reset } = await props.searchParams;
  const nextPath = typeof next === 'string' ? safeNextPath(next) : undefined;

  // Already signed in, nothing to do here.
  if (await getCurrentUser()) {
    redirect(nextPath ?? '/account');
  }

  return (
    <AuthShell>
      <Reveal mode="mount">
        <LoginForm
          next={nextPath}
          headingAs="h1"
          notice={reset === '1' ? 'Password updated. Log in with your new password.' : undefined}
        />
      </Reveal>
    </AuthShell>
  );
}