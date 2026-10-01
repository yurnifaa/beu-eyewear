import { redirect } from 'next/navigation';
import LoginForm from '@/component/LoginForm';
import Reveal from '@/component/Reveal';
import { getCurrentUser, safeNextPath } from '@/lib/auth/session';

export default async function LoginPage(props: PageProps<'/login'>) {
  const { next } = await props.searchParams;
  const nextPath = typeof next === 'string' ? safeNextPath(next) : undefined;

  // Already signed in — nothing to do here.
  if (await getCurrentUser()) {
    redirect(nextPath ?? '/account');
  }

  return (
    <Reveal mode="mount" className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold uppercase">Sign In</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">Welcome back — sign in to continue.</p>
      <LoginForm next={nextPath} />
    </Reveal>
  );
}
