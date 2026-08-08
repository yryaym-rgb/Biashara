import { NextResponse, type NextRequest } from 'next/server';
import { getProfile } from '@/lib/auth/session';
import { searchPlatformData } from '@/lib/platform/command-palette';

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get('q') ?? '';

  try {
    const results = await searchPlatformData(profile.id, query);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: 'search_failed' }, { status: 500 });
  }
}
