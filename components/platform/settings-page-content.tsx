'use client';

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
import { cn } from '@/lib/utils/cn';
import type { Database } from '@/types/database.types';
import type { CooperativeSiteRow } from '@/lib/platform/lots';

type KycDocument = Database['public']['Tables']['kyc_documents']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'];
type KycStatus = Database['public']['Enums']['kyc_status'];
type UserRole = Database['public']['Enums']['user_role'];

export type SettingsTab = 'profile' | 'security' | 'kyc' | 'listings';

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

  const tabs: SettingsTab[] = showListingsTab
    ? ['profile', 'security', 'kyc', 'listings']
    : ['profile', 'security', 'kyc'];

  const activeTab = tabs.includes(initialTab) ? initialTab : 'profile';

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

      <div className={cn(activeTab !== 'profile' && 'hidden')}>
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

      <div className={cn(activeTab !== 'security' && 'hidden')}>
        <SettingsPasswordForm />
      </div>

      <div className={cn(activeTab !== 'kyc' && 'hidden')}>
        <SettingsKycPanel kycStatus={kycStatus} rejectedDocuments={rejectedDocuments} />
      </div>

      {showListingsTab ? (
        <div className={cn(activeTab !== 'listings' && 'hidden')}>
          <SettingsListingsPanel listings={sellerListings} />
        </div>
      ) : null}
    </div>
  );
}
