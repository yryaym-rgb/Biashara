import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { LandingPriceTicker } from '@/components/marketing/landing-price-ticker';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingPriceTicker />
      <Navbar stickyOffsetClass="top-10" topBandHeight={40} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
