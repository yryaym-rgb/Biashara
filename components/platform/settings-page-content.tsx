'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsProfileForm } from '@/components/platform/settings-profile-form';
import { SettingsPasswordForm } from '@/components/platform/settings-password-form';
import {
  SettingsKycPanel,
  SettingsListingsPanel,
} from '@/components/platform/settings-kyc-listings-panels';
import { CooperativeSitesForm } from '@/components/platform/cooperative-sites-form';
import { ExportReadinessPanel } from '@/components/platform/export-readiness-panel';
import type { Database } from '@/types/database.types';
import type { CooperativeSiteRow } from '@/lib/platform/lots.types';
import type {
  ExportReadinessDocumentOption,
  ExportReadinessItemView,
} from '@/lib/platform/export-readiness';

type KycDocument = Database['public']['Tables']['kyc_documents']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'];
type KycStatus = Database['public']['Enums']['kyc_status'];
type UserRole = Database['public']['Enums']['user_role'];

export type SettingsTab = 'profile' | 'security' | 'kyc' | 'listings' | 'exportReadiness';

function resolveActiveTab(
  tabs: SettingsTab[],
  tabParam: string | null,
  initialTab: SettingsTab,
): SettingsTab {
  if (tabParam && tabs.includes(tabParam as SettingsTab)) {
    return tabParam as SettingsTab;
  }
  return tabs.includes(initialTab) ? initialTab : 'profile';
}

export interface SettingsPageContentProps {
  locale: string;
  email: string;
  role: UserRole;
  memberSince: string;
  companyName: string;
  country: string;
  phone: string;
  kycStatus: KycStatus;
  rejectedDocuments: KycDocument[];
  sellerListings: Listing[];
  showListingsTab: boolean;
  showExportReadinessTab: boolean;
  showCooperativeSites: boolean;
  cooperativeSites: CooperativeSiteRow[];
  exportReadinessItems: ExportReadinessItemView[];
  exportReadinessDocuments: ExportReadinessDocumentOption[];
  initialTab: SettingsTab;
}

export function SettingsPageContent({
  locale,
  email,
  role,
  memberSince,
  companyName,
  country,
  phone,
  kycStatus,
  rejectedDocuments,
  sellerListings,
  showListingsTab,
  showExportReadinessTab,
  showCooperativeSites,
  cooperativeSites,
  exportReadinessItems,
  exportReadinessDocuments,
  initialTab,
}: SettingsPageContentProps) {
  const t = useTranslations('platform.settings');
  const router = useRouter();
  const pathname = usePathname();

  const tabs: SettingsTab[] = [
    'profile',
    'security',
    'kyc',
    ...(showExportReadinessTab ? (['exportReadiness'] as const) : []),
    ...(showListingsTab ? (['listings'] as const) : []),
  ];

  // Server-resolved initialTab avoids useSearchParams during render (hydration mismatch / React #185).
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(() =>
    resolveActiveTab(tabs, null, initialTab),
  );

  React.useEffect(() => {
    const nextTabs: SettingsTab[] = [
      'profile',
      'security',
      'kyc',
      ...(showExportReadinessTab ? (['exportReadiness'] as const) : []),
      ...(showListingsTab ? (['listings'] as const) : []),
    ];
    setActiveTab((current) => {
      const next = resolveActiveTab(nextTabs, null, initialTab);
      return current === next ? current : next;
    });
  }, [initialTab, showExportReadinessTab, showListingsTab]);

  function handleTabChange(value: string) {
    const nextTab = value as SettingsTab;
    if (!tabs.includes(nextTab)) {
      return;
    }

    setActiveTab(nextTab);

    const params = new URLSearchParams();
    if (nextTab !== 'profile') {
      params.set('tab', nextTab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="space-y-6">
      <h1>{t('title')}</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="gap-6 border-0">
          <TabsTrigger value="profile" className="pb-2 text-[15px]">
            {t('tabs.profile')}
          </TabsTrigger>
          <TabsTrigger value="security" className="pb-2 text-[15px]">
            {t('tabs.security')}
          </TabsTrigger>
          <TabsTrigger value="kyc" className="pb-2 text-[15px]">
            {t('tabs.kyc')}
          </TabsTrigger>
          {showExportReadinessTab ? (
            <TabsTrigger value="exportReadiness" className="pb-2 text-[15px]">
              {t('tabs.exportReadiness')}
            </TabsTrigger>
          ) : null}
          {showListingsTab ? (
            <TabsTrigger value="listings" className="pb-2 text-[15px]">
              {t('tabs.listings')}
            </TabsTrigger>
          ) : null}
        </TabsList>
      </Tabs>

      {activeTab === 'profile' ? (
        <div>
          <SettingsProfileForm
            locale={locale}
            email={email}
            role={role}
            memberSince={memberSince}
            initialCompanyName={companyName}
            initialCountry={country}
            initialPhone={phone}
          />
          {showCooperativeSites ? (
            <div className="mt-6">
              <CooperativeSitesForm initialSites={cooperativeSites} />
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'security' ? <SettingsPasswordForm /> : null}

      {activeTab === 'kyc' ? (
        <SettingsKycPanel kycStatus={kycStatus} rejectedDocuments={rejectedDocuments} />
      ) : null}

      {showExportReadinessTab && activeTab === 'exportReadiness' ? (
        <ExportReadinessPanel
          items={exportReadinessItems}
          documents={exportReadinessDocuments}
          locale={locale}
        />
      ) : null}

      {showListingsTab && activeTab === 'listings' ? (
        <SettingsListingsPanel listings={sellerListings} />
      ) : null}
    </div>
  );
}
