import { getTranslations } from 'next-intl/server';
import { Building2, Handshake, Landmark, Users } from 'lucide-react';
import type { EcosystemCounts, EcosystemRoleKey } from '@/lib/admin/dashboard-ecosystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ROLE_ICONS: Record<EcosystemRoleKey, typeof Users> = {
  cooperative: Users,
  seller: Handshake,
  buyer: Building2,
  institution: Landmark,
};

const ROLE_KEYS: EcosystemRoleKey[] = ['cooperative', 'seller', 'buyer', 'institution'];

export interface AdminEcosystemPanelProps {
  counts: EcosystemCounts;
  locale: string;
}

export async function AdminEcosystemPanel({ counts, locale }: AdminEcosystemPanelProps) {
  const t = await getTranslations({ locale, namespace: 'admin.dashboard.ecosystem' });

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
          {t('eyebrow')}
        </p>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {ROLE_KEYS.map((role) => {
            const Icon = ROLE_ICONS[role];
            return (
              <div
                key={role}
                className="relative rounded-card border border-border bg-bg p-6 card-shadow"
              >
                <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-button bg-bg-tint">
                  <Icon className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <p className="text-[28px] font-bold tabular-nums text-ink">{counts[role]}</p>
                <p className="mt-1 text-[13px] text-muted">{t(`roles.${role}`)}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
