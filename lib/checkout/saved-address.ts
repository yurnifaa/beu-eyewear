import 'server-only';

import type { AddressFields } from '@/lib/checkout/address';
import { prisma } from '@/lib/prisma';

// Returns only the address fields (no id/userId), so the result is safe to hand
// to a client component.
export async function getSavedAddress(userId: string): Promise<AddressFields | null> {
  return prisma.savedAddress.findUnique({
    where: { userId },
    select: { fullName: true, address: true, city: true, province: true, zip: true, phone: true },
  });
}
