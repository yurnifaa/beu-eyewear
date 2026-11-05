import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { cancelStaleUnpaidOrders, UNPAID_ORDER_TTL_HOURS } from '@/lib/orders/expire-unpaid';
import { revalidateOrderViews } from '@/lib/orders/revalidate';

// Run daily by Vercel Cron (see vercel.json). When the CRON_SECRET environment variable
// is set, Vercel sends it as `Authorization: Bearer <secret>` with every cron call; this
// route refuses anything else, so nobody can trigger it from the outside.
// (Vercel's free Hobby plan allows cron jobs to run at most once a day.)
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get('authorization');
  if (!secret || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // `?hours=0` lets you try it without waiting a day (still needs the secret).
  const requested = new URL(request.url).searchParams.get('hours');
  const parsed = requested === null || requested === '' ? NaN : Number(requested);
  const hours = Number.isFinite(parsed) && parsed >= 0 ? parsed : UNPAID_ORDER_TTL_HOURS;

  try {
    const result = await cancelStaleUnpaidOrders(hours);
    for (const id of result.cancelledIds) revalidateOrderViews(id);
    return NextResponse.json({ cancelled: result.cancelledIds.length, skipped: result.skipped, olderThanHours: hours });
  } catch (error) {
    console.error('expire-unpaid-orders failed', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
