import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getProfile, getUser } from '@/lib/auth/session';

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  const profile = user ? await getProfile() : null;

  return (
    <>
      <Navbar
        isAuthenticated={Boolean(user)}
        companyName={profile?.company_name ?? null}
        email={user?.email ?? null}
      />
      <main>{children}</main>
      <Footer />
    </>
  );
}
