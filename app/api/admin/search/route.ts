import { NextResponse, type NextRequest } from 'next/server';
import { getProfile } from '@/lib/auth/session';
import { requireRole } from '@/lib/rbac';
import { searchAdminPlatformData } from '@/lib/admin/search';

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  try {
    requireRole(profile, ['admin']);
  } catch {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const query = request.nextUrl.searchParams.get('q') ?? '';

  try {
    const results = await searchAdminPlatformData(query);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: 'search_failed' }, { status: 500 });
  }
}
