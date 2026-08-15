import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { getLocaleFromPathname } from '@/lib/i18n/pathname';
import { routing } from '@/lib/i18n/routing';
import { createMiddlewareClient } from '@/lib/supabase/middleware';
import { canAccessRoute } from '@/lib/rbac';
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const intlMiddleware = createMiddleware(routing);

const PUBLIC_API_ROUTES = ['/api/health', '/api/prices', '/api/activity-feed'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const { supabase, supabaseResponse } = createMiddlewareClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const locale = getLocaleFromPathname(pathname);

  const access = canAccessRoute(pathname, profile, locale);
  if (!access.allowed && access.redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = access.redirectTo;
    return NextResponse.redirect(url);
  }

  const intlResponse = intlMiddleware(request);

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
