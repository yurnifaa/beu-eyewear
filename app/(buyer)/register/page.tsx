import { redirect } from 'next/navigation';
import RegisterForm from '@/component/RegisterForm';
import AuthShell from '@/component/auth/AuthShell';
import Reveal from '@/component/Reveal';
import { getCurrentUser, safeNextPath } from '@/lib/auth/session';

export default async function RegisterPage(props: PageProps<'/register'>) {
  const { next } = await props.searchParams;
  const nextPath = typeof next === 'string' ? safeNextPath(next) : undefined;

  if (await getCurrentUser()) {
    redirect(nextPath ?? '/account');
  }

  return (
    <AuthShell>
      <Reveal mode="mount">
        <RegisterForm next={nextPath} />
      </Reveal>
    </AuthShell>
  );
}
