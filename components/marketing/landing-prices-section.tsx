import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { LivePricesCard } from '@/components/marketing/live-prices-card';
import { MarketTrendCard } from '@/components/marketing/market-trend-card';

export async function LandingPricesSection() {
  const t = await getTranslations('marketing.landing.prices');

  return (
    <section className="bg-bg-tint py-14 lg:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[35fr_65fr] lg:gap-16 lg:items-start">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <SectionHeading
              eyebrow={t('eyebrow')}
              title={t('title')}
              subtitle={t('description')}
            />
            <div>
              <Button asChild variant="primary">
                <Link href="/solutions">{t('ctaSolutions')}</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 min-[1025px]:grid-cols-[3fr_2fr]">
            <ScrollReveal>
              <LivePricesCard />
            </ScrollReveal>
            <ScrollReveal>
              <MarketTrendCard />
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
