import {
  Check,
  LineChart,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { LotCustodyChainVisual } from '@/components/marketing/lot-custody-chain-visual';
import { ConnectedChainVisual } from '@/components/marketing/connected-chain-visual';
import { PillarMarketDataPanel } from '@/components/marketing/pillar-market-data-panel';
import { PillarMiniPriceChart } from '@/components/marketing/pillar-mini-price-chart';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { NORMAL_SHIPMENT_STATUSES } from '@/lib/platform/shipment-status';
import { cn } from '@/lib/utils/cn';

type PillarKey = 'prices' | 'traceability' | 'trust' | 'logistics' | 'marketData';

const PILLAR_ICONS: Record<PillarKey, typeof LineChart> = {
  prices: LineChart,
  traceability: Package,
  trust: ShieldCheck,
  logistics: Truck,
  marketData: LineChart,
};

const TRUST_CHECK_KEYS = ['kyc', 'identity'] as const;

const LOGISTICS_STATUS_KEYS = NORMAL_SHIPMENT_STATUSES;

function PillarNumber({
  number,
  tint,
}: {
  number: string;
  tint: 'gold' | 'blue';
}) {
  return (
    <span
      className={cn(
        'text-[48px] font-bold leading-none tabular-nums',
        tint === 'gold' ? 'text-brand-gold' : 'text-brand-blue',
      )}
      aria-hidden="true"
    >
      {number}
    </span>
  );
}

function PillarIcon({ pillarKey, tint }: { pillarKey: PillarKey; tint: 'gold' | 'blue' }) {
  const Icon = PILLAR_ICONS[pillarKey];

  return (
    <div
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-button',
        tint === 'gold'
          ? 'bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)]'
          : 'bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)]',
      )}
    >
      <Icon className="h-6 w-6 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
    </div>
  );
}

export async function LandingInfrastructureSection() {
  const t = await getTranslations('marketing.landing.infrastructure');

  return (
    <section className="bg-bg-tint py-14 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          className="mb-12"
        />

        <div className="flex flex-col gap-8">
          {/* 01 PRIX */}
          <ScrollReveal>
            <article
              className={cn(
                'rounded-card border border-border bg-bg p-6 card-shadow',
                'lg:grid lg:grid-cols-[1fr_minmax(0,320px)] lg:items-center lg:gap-8 lg:p-8',
              )}
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <PillarNumber number={t('pillars.prices.number')} tint="gold" />
                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <PillarIcon pillarKey="prices" tint="gold" />
                      <p className="eyebrow">{t('pillars.prices.tag')}</p>
                    </div>
                    <h3 className="text-[18px] font-semibold text-ink">
                      {t('pillars.prices.title')}
                    </h3>
                    <p className="text-[15px] text-body">{t('pillars.prices.description')}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 lg:mt-0">
                <PillarMiniPriceChart />
              </div>
            </article>
          </ScrollReveal>

          {/* 02 TRAÇABILITÉ */}
          <ScrollReveal>
            <article className="rounded-card border border-border bg-bg p-6 card-shadow lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <PillarNumber number={t('pillars.traceability.number')} tint="blue" />
                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <PillarIcon pillarKey="traceability" tint="blue" />
                      <p className="eyebrow">{t('pillars.traceability.tag')}</p>
                    </div>
                    <h3 className="text-[18px] font-semibold text-ink">
                      {t('pillars.traceability.title')}
                    </h3>
                    <p className="text-[15px] text-body">
                      {t('pillars.traceability.description')}
                    </p>
                  </div>
                </div>

                <div className="rounded-card border border-border bg-bg-tint p-4 sm:p-6">
                  <LotCustodyChainVisual />
                </div>

                <p className="text-[13px] text-muted">{t('pillars.traceability.selfReportedLabel')}</p>
              </div>
            </article>
          </ScrollReveal>

          {/* 03 CONFIANCE */}
          <ScrollReveal>
            <article
              className={cn(
                'rounded-card border border-border bg-bg p-6 card-shadow lg:p-8',
                'lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12',
              )}
            >
              <div className="flex items-start gap-4">
                <PillarNumber number={t('pillars.trust.number')} tint="gold" />
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <PillarIcon pillarKey="trust" tint="gold" />
                    <p className="eyebrow">{t('pillars.trust.tag')}</p>
                  </div>
                  <h3 className="text-[18px] font-semibold text-ink">
                    {t('pillars.trust.title')}
                  </h3>
                  <p className="text-[15px] text-body">{t('pillars.trust.description')}</p>
                </div>
              </div>

              <ul className="mt-6 flex flex-col gap-3 lg:mt-0 lg:min-w-[220px]">
                {TRUST_CHECK_KEYS.map((checkKey) => (
                  <li
                    key={checkKey}
                    className="flex items-center gap-3 rounded-card border border-border bg-bg-tint px-4 py-3"
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-button',
                        'bg-[color-mix(in_srgb,var(--success)_12%,transparent)]',
                      )}
                    >
                      <Check className="h-4 w-4 text-success" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-[15px] font-semibold text-ink">
                      {t(`pillars.trust.checks.${checkKey}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </ScrollReveal>

          {/* 04 LOGISTIQUE */}
          <ScrollReveal>
            <article className="rounded-card border border-border bg-bg p-6 card-shadow lg:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <PillarNumber number={t('pillars.logistics.number')} tint="blue" />
                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <PillarIcon pillarKey="logistics" tint="blue" />
                      <p className="eyebrow">{t('pillars.logistics.tag')}</p>
                    </div>
                    <h3 className="text-[18px] font-semibold text-ink">
                      {t('pillars.logistics.title')}
                    </h3>
                    <p className="text-[15px] text-body">{t('pillars.logistics.description')}</p>
                  </div>
                </div>

                <div className="rounded-card border border-border bg-bg-tint p-4 sm:p-6">
                  <ConnectedChainVisual
                    ariaLabel={t('pillars.logistics.statusAriaLabel')}
                    columnCount={5}
                    tint="gold"
                    steps={LOGISTICS_STATUS_KEYS.map((statusKey) => ({
                      id: statusKey,
                      label: t(`pillars.logistics.statuses.${statusKey}`),
                      node: (
                        <MapPin
                          className="h-4 w-4 text-brand-blue"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      ),
                    }))}
                  />
                </div>

                <p className="text-[13px] text-muted">{t('pillars.logistics.caption')}</p>
              </div>
            </article>
          </ScrollReveal>

          {/* 05 DONNÉES DE MARCHÉ */}
          <ScrollReveal>
            <article
              className={cn(
                'rounded-card border border-border bg-bg p-6 card-shadow',
                'lg:grid lg:grid-cols-[1fr_minmax(0,380px)] lg:items-start lg:gap-8 lg:p-8',
              )}
            >
              <div className="flex items-start gap-4">
                <PillarNumber number={t('pillars.marketData.number')} tint="gold" />
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <PillarIcon pillarKey="marketData" tint="gold" />
                    <p className="eyebrow">{t('pillars.marketData.tag')}</p>
                  </div>
                  <h3 className="text-[18px] font-semibold text-ink">
                    {t('pillars.marketData.title')}
                  </h3>
                  <p className="text-[15px] text-body">{t('pillars.marketData.description')}</p>
                </div>
              </div>

              <div className="mt-6 lg:mt-0">
                <PillarMarketDataPanel />
              </div>
            </article>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
