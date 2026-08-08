'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { useSearchParamValues } from '@/lib/hooks/use-search-param-values';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsProfileForm } from '@/components/platform/settings-profile-form';
import { SettingsPasswordForm } from '@/components/platform/settings-password-form';
import {
  SettingsKycPanel,
  SettingsListingsPanel,
} from '@/components/platform/settings-kyc-listings-panels';
import { CooperativeSitesForm } from '@/components/platform/cooperative-sites-form';
import type { Database } from '@/types/database.types';
import type { CooperativeSiteRow } from '@/lib/platform/lots.types';

type KycDocument = Database['public']['Tables']['kyc_documents']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'];
type KycStatus = Database['public']['Enums']['kyc_status'];
type UserRole = Database['public']['Enums']['user_role'];

export type SettingsTab = 'profile' | 'security' | 'kyc' | 'listings';

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
  showCooperativeSites: boolean;
  cooperativeSites: CooperativeSiteRow[];
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
  showCooperativeSites,
  cooperativeSites,
  initialTab,
}: SettingsPageContentProps) {
  const t = useTranslations('platform.settings');
  const router = useRouter();
  const pathname = usePathname();
  const { tab: tabParam } = useSearchParamValues(['tab']);

  const tabs: SettingsTab[] = showListingsTab
    ? ['profile', 'security', 'kyc', 'listings']
    : ['profile', 'security', 'kyc'];

  const activeTab = resolveActiveTab(tabs, tabParam ?? null, initialTab);

  function handleTabChange(value: string) {
    const params = new URLSearchParams();
    if (value !== 'profile') {
      params.set('tab', value);
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

      {showListingsTab && activeTab === 'listings' ? (
        <SettingsListingsPanel listings={sellerListings} />
      ) : null}
    </div>
  );
}
