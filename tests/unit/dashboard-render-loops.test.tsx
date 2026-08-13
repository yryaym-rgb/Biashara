import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardGreetingBar } from '@/components/platform/dashboard/dashboard-greeting-bar';
import { DashboardMarketPulse } from '@/components/platform/dashboard/dashboard-market-pulse';
import { AdminMarketPulse } from '@/components/admin/admin-market-pulse';
import { AdminKpiSparkline } from '@/components/admin/admin-kpi-sparkline';
import { DashboardMarketInsight } from '@/components/platform/dashboard-market-insight';
import { DashboardTradingMix } from '@/components/platform/dashboard-trading-mix';
import { DashboardSalesChart } from '@/components/platform/dashboard-sales-chart';
import { DrcMiningMap } from '@/components/marketing/drc-mining-map';
import type { PricesResponse } from '@/lib/prices/types';

const mockPricesResponse: PricesResponse = {
  minerals: [
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
    {
      mineral: 'copper',
      price: 9500,
      currency: 'USD',
      unit: 'MT',
      priceType: 'fixed',
      source: 'metals.dev',
      fetchedAt: '2026-08-12T10:30:00.000Z',
      isIndicative: false,
      change: -0.8,
    },
    {
      mineral: 'cobalt',
      price: 32000,
      currency: 'USD',
      unit: 'MT',
      priceType: 'fixed',
      source: 'metals.dev',
      fetchedAt: '2026-08-12T10:30:00.000Z',
      isIndicative: false,
      change: 0.5,
    },
    {
      mineral: 'lithium',
      price: 12000,
      currency: 'USD',
      unit: 'MT',
      priceType: 'fixed',
      source: 'metals.dev',
      fetchedAt: '2026-08-12T10:30:00.000Z',
      isIndicative: false,
      change: -1.1,
    },
  ],
  cachedAt: '2026-08-12T10:30:00.000Z',
  fromCache: false,
};

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, unknown>) => {
    if (values) {
      return `${namespace ?? 't'}.${key}:${JSON.stringify(values)}`;
    }
    return `${namespace ?? 't'}.${key}`;
  },
  useLocale: () => 'fr',
}));

vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard',
}));

vi.mock('@/lib/prices/fetch-client', () => ({
  fetchPricesClient: vi.fn(async () => mockPricesResponse),
}));

vi.mock('recharts', async () => {
  const React = await import('react');
  const ChartShell = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Noop = () => null;
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ChartShell,
    Line: Noop,
    AreaChart: ChartShell,
    Area: Noop,
    PieChart: ChartShell,
    Pie: ChartShell,
    Cell: Noop,
    CartesianGrid: Noop,
    XAxis: Noop,
    YAxis: Noop,
    Tooltip: Noop,
  };
});

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('dashboard client components avoid render loops', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    consoleErrorSpy.mockRestore();
  });

  function assertNoUpdateDepthError() {
    const depthErrors = consoleErrorSpy.mock.calls.filter(([message]) =>
      String(message).includes('Maximum update depth exceeded'),
    );
    expect(depthErrors).toHaveLength(0);
  }

  it('DashboardGreetingBar mounts without update-depth errors', async () => {
    render(
      <DashboardGreetingBar
        displayName="Test Coop"
        role="cooperative"
        kycStatus="approved"
        greetingPeriod="morning"
      />,
    );
    await waitFor(() => undefined, { timeout: 500 });
    assertNoUpdateDepthError();
  });

  it('DashboardMarketPulse mounts and resolves prices without update-depth errors', async () => {
    renderWithQuery(<DashboardMarketPulse />);
    await waitFor(() => undefined, { timeout: 1000 });
    assertNoUpdateDepthError();
  });

  it('AdminMarketPulse mounts and resolves prices without update-depth errors', async () => {
    renderWithQuery(<AdminMarketPulse reportsHref="/reports" />);
    await waitFor(() => undefined, { timeout: 1000 });
    assertNoUpdateDepthError();
  });

  it('AdminKpiSparkline mounts without update-depth errors', async () => {
    render(
      <AdminKpiSparkline
        data={[
          { period: '2026-08-01', value: 1 },
          { period: '2026-08-08', value: 2 },
        ]}
        ariaLabel="Users trend"
      />,
    );
    await waitFor(() => undefined, { timeout: 500 });
    assertNoUpdateDepthError();
  });

  it('DashboardMarketInsight mounts without update-depth errors', async () => {
    render(
      <DashboardMarketInsight
        insight={{
          mineral: 'cobalt',
          percentChange: 2.4,
          currency: 'USD',
          sparkline: [
            { date: '2026-08-01', price: 100 },
            { date: '2026-08-08', price: 110 },
          ],
        }}
      />,
    );
    await waitFor(() => undefined, { timeout: 500 });
    assertNoUpdateDepthError();
  });

  it('DrcMiningMap admin mode mounts without update-depth errors', async () => {
    render(
      <DrcMiningMap
        listingCounts={{ Lualaba: 3 }}
        cooperativeCounts={{ Lualaba: 1 }}
        mode="admin"
      />,
    );
    await waitFor(() => undefined, { timeout: 500 });
    assertNoUpdateDepthError();
  });

  it('DashboardTradingMix mounts without update-depth errors', async () => {
    render(
      <DashboardTradingMix
        segments={[
          { mineral: 'cobalt', count: 3 },
          { mineral: 'copper', count: 2 },
        ]}
      />,
    );
    await waitFor(() => undefined, { timeout: 500 });
    assertNoUpdateDepthError();
  });

  it('DashboardSalesChart mounts without update-depth errors', async () => {
    render(
      <DashboardSalesChart
        data={[
          { date: '2026-08-01', volume: 1000 },
          { date: '2026-08-08', volume: 1500 },
        ]}
      />,
    );
    await waitFor(() => undefined, { timeout: 500 });
    assertNoUpdateDepthError();
  });
});
