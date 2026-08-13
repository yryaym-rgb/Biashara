import { ArrowRight, ClipboardList, Package, Search, Send, ShoppingBag, Truck } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { isCooperativeRole, isSellerRole } from '@/lib/rbac';
import { getDashboardPrimaryQuickActionKeys } from '@/lib/platform/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import type { Database } from '@/types/database.types';

export interface DashboardQuickActionsProps {
  locale: string;
  role: Database['public']['Enums']['user_role'];
  kycApproved: boolean;
}

export async function DashboardQuickActions({
  locale,
  role,
  kycApproved,
}: DashboardQuickActionsProps) {
  const t = await getTranslations({ locale, namespace: 'platform.dashboard.quickActions' });

  const isCooperative = isCooperativeRole(role);
  const isSeller = isSellerRole(role);
  const primaryActionKeys = getDashboardPrimaryQuickActionKeys(role);

  const publishHref = isCooperative
    ? '/lots/new'
    : isSeller && kycApproved
      ? '/marketplace/new'
      : '/marketplace';

  const actionCatalog = {
    'publish-lot': {
      href: publishHref,
      title: t('publishLot.title'),
      description: t('publishLot.description'),
      icon: Package,
    },
    'publish-listing': {
      href: publishHref,
      title: t('publishListing.title'),
      description: t('publishListing.description'),
      icon: ShoppingBag,
    },
    explore: {
      href: '/marketplace' as const,
      title: t('exploreMarket.title'),
      description: t('exploreMarket.description'),
      icon: Search,
    },
    'publish-rfp': {
      href: '/rfps/new' as const,
      title: t('publishRfp.title'),
      description: t('publishRfp.description'),
      icon: ClipboardList,
    },
  } as const;

  const primaryActions = primaryActionKeys.map((key) => ({
    key,
    ...actionCatalog[key],
  }));

  const secondaryLinks = [
    { key: 'offers', href: '/offers' as const, title: t('myOffers'), icon: Send },
    { key: 'orders', href: '/orders' as const, title: t('myOrders'), icon: Truck },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      {primaryActions.map((action) => (
        <Link key={action.key} href={action.href} className="block">
          <Card hoverable className="h-full">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint">
                <action.icon
                  className="h-5 w-5 text-brand-blue"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[18px] font-semibold text-ink">
                  {action.title}
                  <ArrowRight
                    className="ml-1 inline h-4 w-4 align-text-bottom text-brand-gold-dark"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </p>
                <p className="mt-1 text-[13px] text-body">{action.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      <div className="flex flex-col gap-2 pt-2">
        {secondaryLinks.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className="flex items-center gap-2 rounded-button px-2 py-2 text-[15px] font-semibold text-brand-blue transition-colors hover:bg-bg-tint hover:text-brand-blue-dark"
          >
            <link.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            <span>
              {link.title}
              <ArrowRight
                className="ml-1 inline h-3.5 w-3.5 align-text-bottom"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
