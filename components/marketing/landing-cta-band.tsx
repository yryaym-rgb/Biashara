import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { KitengeStrip } from '@/components/ui/kitenge-strip';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';

export async function LandingCtaBand() {
  const t = await getTranslations('marketing.landing.cta');

  return (
    <section className="relative overflow-hidden bg-brand-blue-dark py-14 lg:py-24">
      <KitengeStrip
        className="pointer-events-none absolute inset-0 h-full opacity-[0.13]"
      />

      <Container className="relative z-[1]">
        <ScrollReveal>
          <div className="mx-auto flex max-w-[700px] flex-col items-center gap-6 text-center">
            <h2 className="text-[28px] font-bold leading-tight text-[color:var(--white)] min-[481px]:text-[34px]">
              {t('title')}
            </h2>
            <p className="text-base text-[color:color-mix(in_srgb,var(--white)_80%,transparent)]">
              {t('subtitle')}
            </p>
            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:justify-center">
              <Button asChild variant="primary" className="w-full sm:w-auto">
                <Link href="/register">{t('primaryCta')}</Link>
              </Button>
              <Button asChild variant="outline-light" className="w-full sm:w-auto">
                <Link href="/marketplace">{t('secondaryCta')}</Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
