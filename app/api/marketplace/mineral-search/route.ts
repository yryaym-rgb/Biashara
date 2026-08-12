import { NextResponse, type NextRequest } from 'next/server';
import {
  getMineralSearchCounts,
  parseMineralSearchIds,
} from '@/lib/marketplace/mineral-search.queries';
import { checkRateLimit } from '@/lib/rate-limit';

const MINERAL_SEARCH_RATE_LIMIT = { limit: 120, windowMs: 60_000 };

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = await checkRateLimit(
    `marketplace-mineral-search:${ip}`,
    MINERAL_SEARCH_RATE_LIMIT.limit,
    MINERAL_SEARCH_RATE_LIMIT.windowMs,
  );

  if (!limit.success) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
      },
    );
  }

  const mineralIds = parseMineralSearchIds(request.nextUrl.searchParams.get('minerals'));
  if (!mineralIds) {
    return NextResponse.json({ error: 'invalid_minerals' }, { status: 400 });
  }

  try {
    const suggestions = await getMineralSearchCounts(mineralIds);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: 'mineral_search_failed' }, { status: 500 });
  }
}
