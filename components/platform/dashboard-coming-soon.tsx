'use client';

import { useTranslations } from 'next-intl';
import { Shield, Sparkles as SparklesIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function ComingSoonBadge() {
  const t = useTranslations('common');
  return <Badge variant="warning">{t('comingSoon')}</Badge>;
}

function ComingSoonCardShell({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed opacity-60">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint">
            {icon}
          </div>
          <ComingSoonBadge />
        </div>
        <div className="space-y-2">
          <h3 className="text-[18px] font-semibold text-ink">{title}</h3>
          <p className="text-[15px] text-body">{description}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

/** Part F — Paiement sécurisé (coming soon) */
export function DashboardEscrowComingSoon() {
  const t = useTranslations('platform.dashboard.comingSoon.escrow');

  return (
    <ComingSoonCardShell
      icon={<Shield className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />}
      title={t('title')}
      description={t('description')}
    />
  );
}

/** Part G — Conformité (coming soon) */
export function DashboardComplianceComingSoon() {
  const t = useTranslations('platform.dashboard.comingSoon.compliance');

  return (
    <Card className="border-dashed opacity-60">
      <CardContent className="p-6">
        <div className="mb-4 flex justify-end">
          <ComingSoonBadge />
        </div>
        <p className="text-[15px] leading-[1.65] text-body">{t('prose')}</p>
      </CardContent>
    </Card>
  );
}

/** Part H — Recommandations intelligentes (coming soon) */
export function DashboardRecommendationsComingSoon() {
  const t = useTranslations('platform.dashboard.comingSoon.recommendations');

  return (
    <ComingSoonCardShell
      icon={<SparklesIcon className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />}
      title={t('title')}
      description={t('description')}
    />
  );
}
