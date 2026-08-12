import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { LandingPricesShowcase } from '@/components/marketing/landing-prices-showcase';

export async function LandingPricesSection() {
  const t = await getTranslations('marketing.landing.prices');

  return (
    <section className="bg-bg-tint py-14 lg:py-24">
      <Container>
        <div className="flex flex-col gap-12 lg:gap-16">
          <SectionHeading
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('description')}
          />

          <ScrollReveal>
            <LandingPricesShowcase />
          </ScrollReveal>

          <div>
            <Button asChild variant="primary">
              <Link href="/prices">{t('ctaPrices')}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
