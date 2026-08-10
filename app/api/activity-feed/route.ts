import { NextResponse, type NextRequest } from 'next/server';
import { assertPublicActivityFeedAnonymized } from '@/lib/activity/public-feed.logic';
import { getPublicActivityFeed } from '@/lib/activity/public-feed.queries';
import { checkRateLimit, ACTIVITY_FEED_RATE_LIMIT } from '@/lib/rate-limit';

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
    `activity-feed:${ip}`,
    ACTIVITY_FEED_RATE_LIMIT.limit,
    ACTIVITY_FEED_RATE_LIMIT.windowMs,
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

  try {
    const feed = await getPublicActivityFeed();
    assertPublicActivityFeedAnonymized(feed);
    return NextResponse.json(feed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'activity_feed_error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
