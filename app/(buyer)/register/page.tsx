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
    <Reveal mode="mount" className="mx-auto w-full max-w-md px-6 py-12">
      <div className="rounded-2xl border border-border bg-white px-6 py-8 shadow-lg sm:px-10 dark:bg-background">
        <RegisterForm next={nextPath} />
      </div>
    </Reveal>
  );
}
