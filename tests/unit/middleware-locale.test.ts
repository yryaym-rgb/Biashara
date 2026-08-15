import { describe, it, expect } from 'vitest';
import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from '@/lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

function createRequest(pathname: string, acceptLanguage?: string): NextRequest {
  const headers = new Headers();
  if (acceptLanguage !== undefined) {
    headers.set('accept-language', acceptLanguage);
  }
  return new NextRequest(new URL(`http://localhost:3000${pathname}`), { headers });
}

describe('locale middleware defaults', () => {
  it('routing config uses French as default locale with detection disabled', () => {
    expect(routing.defaultLocale).toBe('fr');
    expect(routing.localeDetection).toBe(false);
  });

  it('serves French at root when Accept-Language is absent', () => {
    const response = intlMiddleware(createRequest('/'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe('fr');
  });

  it('serves French at root when Accept-Language prefers English', () => {
    const response = intlMiddleware(createRequest('/', 'en-US,en;q=0.9'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe('fr');
  });

  it('serves English when /en prefix is present', () => {
    const response = intlMiddleware(createRequest('/en'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe('en');
  });

  it('serves Chinese when /zh prefix is present', () => {
    const response = intlMiddleware(createRequest('/zh'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe('zh');
  });

  it('serves Spanish when /es prefix is present', () => {
    const response = intlMiddleware(createRequest('/es'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe('es');
  });

  it('serves French at root when Accept-Language prefers Chinese', () => {
    const response = intlMiddleware(createRequest('/', 'zh-CN,zh;q=0.9'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe('fr');
  });

  it('serves French at root when Accept-Language prefers Spanish', () => {
    const response = intlMiddleware(createRequest('/', 'es-ES,es;q=0.9'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe('fr');
  });

  const marketingRoutes = ['/prices', '/calendar', '/solutions', '/resources', '/about'] as const;

  it.each(marketingRoutes)(
    'serves French at %s without locale prefix',
    (pathname) => {
      const response = intlMiddleware(createRequest(pathname));
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-request-x-next-intl-locale')).toBe('fr');
    },
  );
});
