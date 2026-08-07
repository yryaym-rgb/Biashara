import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://biashara.cd';

const PUBLIC_PATHS = ['', '/marketplace', '/prices', '/solutions', '/resources', '/about'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.flatMap((path) => [
    {
      url: `${BASE_URL}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    },
    {
      url: `${BASE_URL}/en${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    },
  ]);
}
