import type { PublicActivityFeedResponse } from '@/lib/activity/public-feed.types';

export async function fetchPublicActivityFeedClient(): Promise<PublicActivityFeedResponse> {
  const response = await fetch('/api/activity-feed', {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Activity feed error: ${response.status}`);
  }

  return (await response.json()) as PublicActivityFeedResponse;
}
