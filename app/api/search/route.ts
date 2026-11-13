import { NextResponse, type NextRequest } from 'next/server';
import { getSearchSuggestions } from '@/lib/catalog/queries';

const MAX_QUERY_LENGTH = 80;

// The header search dropdown asks here while the shopper types. Matching is the same as the
// /search page; the catalog read behind it is cached, so a burst of keystrokes is cheap.
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH);

  if (query === '') {
    return NextResponse.json({ products: [] });
  }

  try {
    return NextResponse.json({ products: await getSearchSuggestions(query) });
  } catch (error) {
    console.error('search suggestions failed', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Search temporarily unavailable.' }, { status: 503 });
  }
}
