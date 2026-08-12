import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';

export default async function NavbarFixturePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ auth?: string }>;
}) {
  if (process.env.ALLOW_NAVBAR_FIXTURE !== '1') {
    notFound();
  }

  const { locale } = await params;
  const { auth } = await searchParams;
  setRequestLocale(locale);

  const isAuthenticated = auth === 'member';

  return (
    <div className="min-h-screen bg-bg">
      <Navbar
        isAuthenticated={isAuthenticated}
        companyName={isAuthenticated ? 'ABC Mining' : null}
        email={isAuthenticated ? 'user@example.com' : null}
      />
      <main className="sr-only">Navbar layout fixture</main>
    </div>
  );
}
