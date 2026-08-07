export const RESOURCE_ARTICLE_SLUGS = [
  'kyc-minier-rdc',
  'tracabilite-minerais',
  'lire-cotations-internationales',
] as const;

export type ResourceArticleSlug = (typeof RESOURCE_ARTICLE_SLUGS)[number];

export function isResourceArticleSlug(value: string): value is ResourceArticleSlug {
  return (RESOURCE_ARTICLE_SLUGS as readonly string[]).includes(value);
}

export const RESOURCE_ARTICLES: Array<{
  slug: ResourceArticleSlug;
  readTimeMinutes: number;
  paragraphs: readonly string[];
}> = [
  {
    slug: 'kyc-minier-rdc',
    readTimeMinutes: 5,
    paragraphs: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
  },
  {
    slug: 'tracabilite-minerais',
    readTimeMinutes: 6,
    paragraphs: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
  },
  {
    slug: 'lire-cotations-internationales',
    readTimeMinutes: 4,
    paragraphs: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'],
  },
];
