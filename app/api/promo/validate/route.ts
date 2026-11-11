import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { validatePromoCode } from '@/lib/checkout/promo';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ valid: false, error: 'Sign in to use promo codes.' }, { status: 401 });

  const body = await request.json();
  const code = typeof body.code === 'string' ? body.code : '';
  const subtotal = typeof body.subtotal === 'number' ? body.subtotal : 0;

  const result = await validatePromoCode(code, user.id, subtotal);

  if (!result.ok) {
    return NextResponse.json({ valid: false, error: result.error });
  }

  return NextResponse.json({
    valid: true,
    offerId: result.offerId,
    offerName: result.offerName,
    discountAmount: result.discountAmount,
    freeShipping: result.freeShipping,
  });
}
