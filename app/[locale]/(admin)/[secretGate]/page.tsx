import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  ClipboardCheck,
  FileCheck,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import {
  getDashboardStats,
  getRecentAuditActivity,
  type DashboardStats,
} from '@/lib/admin/queries';
import { safeQuery } from '@/lib/safe-query';
import { StatCard } from '@/components/admin/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  adminAuditLogPath,
  adminKycReviewPath,
  adminListingsModerationPath,
  adminUsersPath,
} from '@/lib/admin/path';
import { formatRelativeTime } from '@/lib/utils/dates';
import { displayName } from '@/lib/admin/display';

const ZERO_DASHBOARD_STATS: DashboardStats = {
  pendingKycDocuments: 0,
  pendingListings: 0,
  verifiedUsers: 0,
  activeListings: 0,
  pendingUsers: 0,
};

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage();

  const t = await getTranslations({ locale, namespace: 'admin.dashboard' });
  const tActivity = await getTranslations({ locale, namespace: 'admin.auditLog' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });

  const [stats, activity] = await Promise.all([
    safeQuery('admin/dashboard/stats', () => getDashboardStats(), ZERO_DASHBOARD_STATS),
    safeQuery('admin/dashboard/activity', () => getRecentAuditActivity(10), []),
  ]);

  const quickLinks = [
    {
      href: adminUsersPath(),
      title: t('quickLinks.users'),
      pending: stats.pendingUsers,
    },
    {
      href: adminKycReviewPath(),
      title: t('quickLinks.kycReview'),
      pending: stats.pendingKycDocuments,
    },
    {
      href: adminListingsModerationPath(),
      title: t('quickLinks.listingsModeration'),
      pending: stats.pendingListings,
    },
    {
      href: adminAuditLogPath(),
      title: t('quickLinks.auditLog'),
      pending: 0,
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
          {t('eyebrow')}
        </p>
        <h1 className="mt-2">{t('title')}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('stats.pendingKyc')}
          value={stats.pendingKycDocuments}
          icon={ShieldCheck}
        />
        <StatCard
          label={t('stats.pendingListings')}
          value={stats.pendingListings}
          icon={FileCheck}
        />
        <StatCard
          label={t('stats.verifiedUsers')}
          value={stats.verifiedUsers}
          icon={Users}
        />
        <StatCard
          label={t('stats.activeListings')}
          value={stats.activeListings}
          icon={ClipboardCheck}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-[15px] text-body">{t('noActivity')}</p>
            ) : (
              <ul className="space-y-4">
                {activity.map((entry) => (
                  <li key={entry.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                    <p className="text-[15px] text-ink">
                      <span className="font-semibold">
                        {displayName(entry.actor_name, tCommon('unknownActor'))}
                      </span>{' '}
                      {tActivity(`actions.${entry.action}` as 'actions.insert')}{' '}
                      <span className="text-body">
                        {tActivity(`entities.${entry.entity}` as 'entities.listings')}
                      </span>
                    </p>
                    <p className="mt-1 text-[13px] text-muted">
                      {formatRelativeTime(entry.created_at, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block">
              <Card hoverable className="h-full">
                <CardContent className="flex items-center justify-between p-6">
                  <span className="text-[18px] font-semibold text-ink">{link.title}</span>
                  {link.pending > 0 ? (
                    <Badge variant="warning">{link.pending}</Badge>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
