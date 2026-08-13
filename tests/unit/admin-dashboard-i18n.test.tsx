import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import fr from '@/messages/fr.json';
import { DrcMiningMap } from '@/components/marketing/drc-mining-map';
import { AdminMarketPulse } from '@/components/admin/admin-market-pulse';

vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin-dashboard',
}));

vi.mock('@/lib/prices/fetch-client', () => ({
  fetchPricesClient: vi.fn(async () => ({
    minerals: [
      {
        mineral: 'coltan',
        price: null,
        currency: 'USD',
        unit: 'kg',
        priceType: 'indicative',
        source: 'none',
        fetchedAt: '2026-08-12T10:30:00.000Z',
        isIndicative: true,
      },
      {
        mineral: 'gold',
        price: 2650,
        currency: 'USD',
        unit: 'oz',
        priceType: 'fixed',
        source: 'metals.dev',
        fetchedAt: '2026-08-12T10:30:00.000Z',
        isIndicative: false,
        change: 1.2,
      },
    ],
    cachedAt: '2026-08-12T10:30:00.000Z',
  })),
}));

function renderWithIntl(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe('admin dashboard i18n keys', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockRestore();
  });

  function assertNoMissingMessageErrors() {
    const missingMessageErrors = consoleErrorSpy.mock.calls.filter(([message]) =>
      String(message).includes('MISSING_MESSAGE'),
    );
    expect(missingMessageErrors).toHaveLength(0);
  }

  function assertNoUpdateDepthErrors() {
    const depthErrors = consoleErrorSpy.mock.calls.filter(([message]) =>
      String(message).includes('Maximum update depth exceeded'),
    );
    expect(depthErrors).toHaveLength(0);
  }

  it('renders admin DRC map hub labels without MISSING_MESSAGE errors', async () => {
    renderWithIntl(
      <DrcMiningMap
        listingCounts={{ Lualaba: 3, 'Haut-Katanga': 1 }}
        cooperativeCounts={{ Lualaba: 1 }}
        mode="admin"
      />,
    );

    await waitFor(() => undefined, { timeout: 500 });
    assertNoMissingMessageErrors();
    assertNoUpdateDepthErrors();
  });

  it('renders admin market pulse indicative copy without MISSING_MESSAGE errors', async () => {
    renderWithIntl(<AdminMarketPulse reportsHref="/reports" />);

    await waitFor(() => undefined, { timeout: 1000 });
    assertNoMissingMessageErrors();
    assertNoUpdateDepthErrors();
  });
});
