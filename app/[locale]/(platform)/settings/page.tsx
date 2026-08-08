import { setRequestLocale } from 'next-intl/server';
import { requireAuth, isSellerRole, isCooperativeRole } from '@/lib/rbac';
import { getProfile, getUser } from '@/lib/auth/session';
import { getUserKycDocuments, getUserListings } from '@/lib/admin/queries';
import { getCooperativeSites } from '@/lib/platform/lots';
import { Container } from '@/components/ui/container';
import {
  SettingsPageContent,
  type SettingsTab,
} from '@/components/platform/settings-page-content';

const SETTINGS_TABS = ['profile', 'security', 'kyc', 'listings'] as const;

function parseSettingsTab(
  value: string | string[] | undefined,
  showListingsTab: boolean,
): SettingsTab {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !SETTINGS_TABS.includes(raw as SettingsTab)) {
    return 'profile';
  }
  if (raw === 'listings' && !showListingsTab) {
    return 'profile';
  }
  return raw as SettingsTab;
}

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const user = await getUser();
  const rawSearchParams = await searchParams;

  const showListingsTab = isSellerRole(profile.role);
  const showCooperativeSites =
    isCooperativeRole(profile.role) && profile.kyc_status === 'approved';

  const [kycDocuments, listings, cooperativeSites] = await Promise.all([
    getUserKycDocuments(profile.id),
    showListingsTab ? getUserListings(profile.id) : Promise.resolve([]),
    showCooperativeSites ? getCooperativeSites(profile.id) : Promise.resolve([]),
  ]);

  const rejectedDocuments = kycDocuments.filter((doc) => doc.status === 'rejected');
  const sellerListings = listings.filter((listing) =>
    ['pending_review', 'active', 'rejected', 'draft', 'paused', 'sold'].includes(listing.status),
  );

  const initialTab = parseSettingsTab(rawSearchParams.tab, showListingsTab);

  return (
    <Container className="py-12 md:py-16">
      <SettingsPageContent
        locale={locale}
        email={user?.email ?? ''}
        role={profile.role}
        memberSince={profile.created_at}
        companyName={profile.company_name ?? ''}
        country={profile.country}
        phone={profile.phone ?? ''}
        kycStatus={profile.kyc_status}
        rejectedDocuments={rejectedDocuments}
        sellerListings={sellerListings}
        showListingsTab={showListingsTab}
        showCooperativeSites={showCooperativeSites}
        cooperativeSites={cooperativeSites}
        initialTab={initialTab}
      />
    </Container>
  );
}
