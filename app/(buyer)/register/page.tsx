import { redirect } from 'next/navigation';
import RegisterForm from '@/component/RegisterForm';
import Reveal from '@/component/Reveal';
import { getCurrentUser, safeNextPath } from '@/lib/auth/session';

export default async function RegisterPage(props: PageProps<'/register'>) {
  const { next } = await props.searchParams;
  const nextPath = typeof next === 'string' ? safeNextPath(next) : undefined;

  if (await getCurrentUser()) {
    redirect(nextPath ?? '/account');
  }

  return (
    <Reveal mode="mount" className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold uppercase">Create Account</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">Sign up to check out and track your orders.</p>
      <RegisterForm next={nextPath} />
    </Reveal>
  );
}
