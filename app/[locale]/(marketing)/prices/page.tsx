import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { PricesPageContent } from '@/components/marketing/prices-page-content';

export default async function PricesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('marketing.prices');

  return (
    <>
      <section className="bg-bg py-14 lg:py-24">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
            className="mb-12"
          />

          <PricesPageContent />
        </Container>
      </section>

      <section className="bg-bg-tint py-14 lg:py-24">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8">{t('guide.title')}</h2>
              <div className="flex flex-col gap-6 text-base text-body">
                <p>{t('guide.paragraph1')}</p>
                <p>{t('guide.paragraph2')}</p>
                <p>{t('guide.paragraph3')}</p>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </>
  );
}
