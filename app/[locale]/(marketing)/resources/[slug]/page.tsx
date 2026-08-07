import { ArrowLeft } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/navigation';
import { Container } from '@/components/ui/container';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import {
  isResourceArticleSlug,
  RESOURCE_ARTICLE_SLUGS,
  RESOURCE_ARTICLES,
} from '@/lib/resources/articles';

export function generateStaticParams() {
  return RESOURCE_ARTICLE_SLUGS.map((slug) => ({ slug }));
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!isResourceArticleSlug(slug)) {
    notFound();
  }

  const t = await getTranslations('marketing.resources');
  const tArticle = await getTranslations(`marketing.resources.articles.${slug}`);
  const articleMeta = RESOURCE_ARTICLES.find((article) => article.slug === slug);

  const paragraphs = (articleMeta?.paragraphs ?? []).map((key) => tArticle(key));

  return (
    <article className="bg-bg py-14 lg:py-24">
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl">
            <Link
              href="/resources"
              className="mb-8 inline-flex items-center gap-2 text-[15px] font-semibold text-brand-blue hover:text-brand-blue-dark motion-safe:transition-colors motion-safe:duration-150"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {t('backToResources')}
            </Link>

            {/* PLACEHOLDER EDITORIAL: pending Joseph's real resource library — replace article bodies in messages/fr.json & en.json */}
            <p className="eyebrow mb-4">{t('eyebrow')}</p>
            <h1 className="mb-4">{tArticle('title')}</h1>
            {articleMeta ? (
              <p className="mb-8 text-[13px] text-muted">
                {t('readTime', { minutes: articleMeta.readTimeMinutes })}
              </p>
            ) : null}

            <div className="flex flex-col gap-6 text-base text-body">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </article>
  );
}
