'use server';

import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, deleteSession, safeNextPath } from '@/lib/auth/session';
import type { FormState } from '@/lib/auth/types';
import { prisma } from '@/lib/prisma';
import { loginSchema, registerSchema } from '@/lib/validation/auth';

export async function register(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await hashPassword(password);

  let userId: string;
  try {
    const user = await prisma.user.create({ data: { name, email, passwordHash }, select: { id: true } });
    userId = user.id;
  } catch (error) {
    // The unique index is the source of truth, so this also covers two sign-ups racing.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { fieldErrors: { email: ['An account with this email already exists'] } };
    }
    throw error;
  }

  await createSession(userId);
  redirect(safeNextPath(formData.get('next')));
}

export async function login(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Same message for unknown email and wrong password so the form can't be
  // used to find out which emails have accounts.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: 'Incorrect email or password' };
  }

  await createSession(user.id);
  redirect(safeNextPath(formData.get('next')));
}

export async function logout() {
  await deleteSession();
  redirect('/home');
}
