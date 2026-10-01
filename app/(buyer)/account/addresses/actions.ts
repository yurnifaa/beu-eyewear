'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function removeSavedAddress() {
  const user = await requireUser();

  // deleteMany so removing an already-removed address (second tab, double
  // click) is a no-op instead of an error.
  await prisma.savedAddress.deleteMany({ where: { userId: user.id } });

  revalidatePath('/account/addresses');
  revalidatePath('/check-out');
}
