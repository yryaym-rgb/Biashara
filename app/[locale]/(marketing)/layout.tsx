import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { LandingPriceTicker } from '@/components/marketing/landing-price-ticker';
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
      <LandingPriceTicker />
      <Navbar
        stickyOffsetClass="top-10"
        topBandHeight={40}
        isAuthenticated={Boolean(user)}
        companyName={profile?.company_name ?? null}
        email={user?.email ?? null}
      />
      <main>{children}</main>
      <Footer />
    </>
  );
}
