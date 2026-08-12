import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { LandingCtaBand } from '@/components/marketing/landing-cta-band';
import { SolutionsAudiencePanels } from '@/components/marketing/solutions-audience-panels';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';

export default async function SolutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('marketing.solutions');

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

          <ScrollReveal>
            <SolutionsAudiencePanels />
          </ScrollReveal>
        </Container>
      </section>

      <LandingCtaBand
        namespace="marketing.solutions.cta"
        primaryHref="/register"
        showSecondary={false}
      />
    </>
  );
}
