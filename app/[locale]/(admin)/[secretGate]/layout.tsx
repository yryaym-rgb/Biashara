import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AdminShell } from '@/components/admin/admin-shell';
import { PassphraseGateForm } from '@/components/admin/passphrase-gate-form';
import { getAdminSessionInfo } from '@/actions/admin/auth';
import { hasAdminGateAccess, isValidAdminGateSegment } from '@/lib/admin/gate';
import { requireAdminPage } from '@/lib/admin/session';
import { displayName } from '@/lib/admin/display';
import {
  adminAuditLogPath,
  adminKycReviewPath,
  adminListingsModerationPath,
  adminPath,
  adminUsersPath,
} from '@/lib/admin/path';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SecretGateAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; secretGate: string }>;
}) {
  const { locale, secretGate } = await params;
  setRequestLocale(locale);

  if (!isValidAdminGateSegment(secretGate)) {
    notFound();
  }

  await requireAdminPage();

  const gateOpen = await hasAdminGateAccess();
  if (!gateOpen) {
    return <PassphraseGateForm />;
  }

  const { profile, email } = await getAdminSessionInfo();
  const adminName = displayName(profile.company_name, email ?? 'Admin');

  const navItems = [
    { key: 'dashboard', href: adminPath() },
    { key: 'users', href: adminUsersPath() },
    { key: 'kycReview', href: adminKycReviewPath() },
    { key: 'listingsModeration', href: adminListingsModerationPath() },
    { key: 'auditLog', href: adminAuditLogPath() },
  ];

  return (
    <AdminShell
      adminName={adminName}
      adminEmail={email}
      locale={locale}
      navItems={navItems}
    >
      {children}
    </AdminShell>
  );
}
