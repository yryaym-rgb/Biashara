import { ArrowRight, BookOpen } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { RESOURCE_ARTICLES } from '@/lib/resources/articles';

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('marketing.resources');

  return (
    <section className="bg-bg py-14 lg:py-24">
      <Container>
        <SectionHeading
          as="h1"
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          className="mb-12"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_ARTICLES.map(({ slug, readTimeMinutes }) => (
            <ScrollReveal key={slug}>
              <Link href={`/resources/${slug}`} className="group block h-full">
                <Card hoverable className="flex h-full flex-col p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-button bg-bg-tint text-brand-blue">
                    <BookOpen className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-[18px] font-semibold text-ink group-hover:text-brand-blue motion-safe:transition-colors motion-safe:duration-150">
                    {t(`articles.${slug}.title`)}
                  </h3>
                  <p className="mb-4 flex-1 text-[13px] leading-snug text-muted">
                    {t(`articles.${slug}.excerpt`)}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[12px] font-semibold text-muted">
                      {t('readTime', { minutes: readTimeMinutes })}
                    </span>
                    <span className="flex items-center gap-1 text-[13px] font-semibold text-brand-blue">
                      {t('readMore')}
                      <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                  </div>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
