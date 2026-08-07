import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://biashara.cd';

export default function robots(): MetadataRoute.Robots {
  const gateSecret = process.env.ADMIN_GATE_SECRET;
  const disallow = [
    '/dashboard',
    '/settings',
    '/login',
    '/register',
    '/forgot-password',
    '/verify',
  ];

  if (gateSecret) {
    disallow.push(`/${gateSecret}`, `/${gateSecret}/*`, `/en/${gateSecret}`, `/en/${gateSecret}/*`);
  }

  return {
    rules: {
      userAgent: '*',
      disallow,
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
