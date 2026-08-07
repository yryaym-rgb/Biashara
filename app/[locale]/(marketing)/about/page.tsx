import { Mail, Users } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeading } from '@/components/ui/section-heading';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('marketing.about');
  const tCredibility = await getTranslations('marketing.landing.credibility');

  return (
    <>
      <section className="bg-bg py-14 lg:py-24">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={t('eyebrow')}
            title={t('mission')}
            className="mb-8"
          />

          <ScrollReveal>
            <p className="max-w-3xl text-base text-body">{tCredibility('subtitle')}</p>
          </ScrollReveal>
        </Container>
      </section>

      <section className="bg-bg-tint py-14 lg:py-24">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-2xl">
              <EmptyState
                icon={<Users className="h-6 w-6" strokeWidth={1.75} />}
                title={t('story.title')}
                description={t('story.description')}
              />
            </div>
          </ScrollReveal>
        </Container>
      </section>

      <section className="bg-bg py-14 lg:py-24">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-button bg-bg-tint text-brand-blue">
                  <Mail className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                </div>
              </div>
              <h2 className="mb-4">{t('contact.title')}</h2>
              <p className="mb-8 text-base text-body">{t('contact.description')}</p>
              <Button asChild variant="primary">
                <Link href="/register">{t('contact.cta')}</Link>
              </Button>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
