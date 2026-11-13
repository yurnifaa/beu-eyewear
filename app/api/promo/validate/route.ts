import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { validatePromoCode } from '@/lib/checkout/promo';
import { cleanText } from '@/lib/validation/clean-text';

const MAX_CODE_LENGTH = 50;
// Far above any real cart; it only stops absurd numbers from reaching the discount math.
const MAX_SUBTOTAL = 10_000_000;

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ valid: false, error: 'Sign in to use promo codes.' }, { status: 401 });

  // Bad JSON, a non-object body or wrong field types are the caller's mistake: answer 400, not 500.
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ valid: false, error: 'Invalid request.' }, { status: 400 });
  }
  const { code: rawCode, subtotal: rawSubtotal } = body as { code?: unknown; subtotal?: unknown };

  const code = typeof rawCode === 'string' ? cleanText(rawCode) : '';
  const subtotal = typeof rawSubtotal === 'number' && Number.isFinite(rawSubtotal) ? rawSubtotal : 0;
  if (code.length > MAX_CODE_LENGTH || subtotal < 0 || subtotal > MAX_SUBTOTAL) {
    return NextResponse.json({ valid: false, error: 'Invalid request.' }, { status: 400 });
  }

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
