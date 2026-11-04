'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, deleteSession } from '@/lib/auth/session';
import type { FormState } from '@/lib/auth/types';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validation/auth';

// The admin app doesn't serve the storefront's /login or /home, so it signs in and
// out through its own actions.

export async function adminLogin(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // One message for unknown email, wrong password and a customer account, so the
  // form can't be used to find out who has an account or who is an admin.
  if (!user || !(await verifyPassword(password, user.passwordHash)) || user.role !== 'ADMIN') {
    return { error: 'Incorrect email or password' };
  }

  await createSession(user.id);
  redirect('/admin');
}

export async function adminLogout() {
  await deleteSession();
  redirect('/admin/login');
}
