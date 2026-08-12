import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PricesResponse } from '@/lib/prices/types';

const { mockPricesResponse, fetchPricesClientMock } = vi.hoisted(() => ({
  mockPricesResponse: {
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
      },
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
        mineral: 'diamond',
        price: null,
        currency: 'USD',
        unit: 'carat',
        priceType: 'indicative',
        source: 'none',
        fetchedAt: '2026-08-12T10:30:00.000Z',
        isIndicative: true,
      },
    ],
    cachedAt: '2026-08-12T10:30:00.000Z',
    fromCache: true,
  } satisfies PricesResponse,
  fetchPricesClientMock: vi.fn(),
}));

import {
  LandingPriceTicker,
  formatKinshasaTime,
  isIndicativeTickerMineral,
  shouldShowChange,
  shouldShowSparkline,
} from '@/components/marketing/landing-price-ticker';

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string, values?: { time?: string }) => {
    const labels: Record<string, Record<string, string>> = {
      'marketing.landing.ticker': {
        ariaLabel: 'Cotations minérales en direct',
        liveLabel: 'MARCHÉ EN DIRECT',
        lastUpdated: `Dernière mise à jour · ${values?.time ?? ''}`,
        indicativeShort: 'Indicatif',
        indicativeLegend: 'Prix indicatif — négocié',
        viewQuote: 'Voir la cotation →',
      },
      'marketing.landing.prices': {
        indicative: 'Prix indicatif — négocié',
      },
      minerals: {
        gold: 'Or',
        copper: 'Cuivre',
        cobalt: 'Cobalt',
        lithium: 'Lithium',
        coltan: 'Coltan',
        diamond: 'Diamant',
      },
      units: {
        oz: '/oz',
        MT: '/TM',
        kg: '/kg',
        carat: '/carat',
      },
    };

    const group = labels[namespace];
    return group?.[key] ?? key;
  },
  useLocale: () => 'fr',
}));

vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/prices/fetch-client', () => ({
  fetchPricesClient: fetchPricesClientMock,
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
}));

function renderTicker() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LandingPriceTicker />
    </QueryClientProvider>,
  );
}

describe('landing price ticker helpers', () => {
  it('shows change only when API provides a numeric value', () => {
    expect(shouldShowChange(1.2)).toBe(true);
    expect(shouldShowChange(0)).toBe(true);
    expect(shouldShowChange(null)).toBe(false);
    expect(shouldShowChange(undefined)).toBe(false);
  });

  it('shows sparkline only with at least two history points', () => {
    expect(shouldShowSparkline(0)).toBe(false);
    expect(shouldShowSparkline(1)).toBe(false);
    expect(shouldShowSparkline(2)).toBe(true);
  });

  it('treats coltan and diamond as indicative when no feed exists', () => {
    expect(isIndicativeTickerMineral('coltan')).toBe(true);
    expect(isIndicativeTickerMineral('diamond')).toBe(true);
    expect(isIndicativeTickerMineral('lithium', false)).toBe(false);
    expect(isIndicativeTickerMineral('copper', false)).toBe(false);
  });

  it('formats last-updated time in Africa/Kinshasa regardless of viewer timezone', () => {
    // 10:30 UTC = 11:30 in Kinshasa (UTC+1)
    expect(formatKinshasaTime('2026-08-12T10:30:00.000Z', 'fr')).toBe('11:30');
    // 22:45 UTC = 23:45 in Kinshasa
    expect(formatKinshasaTime('2026-08-12T22:45:00.000Z', 'en')).toBe('23:45');
  });
});

describe('LandingPriceTicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchPricesClientMock.mockResolvedValue(mockPricesResponse);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders delta for minerals with API change and omits it when absent', async () => {
    renderTicker();

    expect(await screen.findByText('MARCHÉ EN DIRECT')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/\+1\.2%/)).toBeInTheDocument();
    });

    const goldLabel = screen.getByText('Or');
    expect(goldLabel.parentElement).toHaveTextContent('▲');

    const copperLabel = screen.getByText('Cuivre');
    expect(copperLabel.parentElement).not.toHaveTextContent('%');
  });

  it('never renders fabricated prices or deltas for coltan and diamond', async () => {
    renderTicker();

    expect(await screen.findByText('Coltan')).toBeInTheDocument();
    expect(await screen.findByText('Diamant')).toBeInTheDocument();

    const indicativeMatches = screen.getAllByText('Indicatif');
    expect(indicativeMatches.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Prix indicatif — négocié')).toBeInTheDocument();

    const coltanLabel = screen.getByText('Coltan');
    const diamondLabel = screen.getByText('Diamant');
    expect(coltanLabel.parentElement).toHaveTextContent('Indicatif');
    expect(diamondLabel.parentElement).toHaveTextContent('Indicatif');
    expect(coltanLabel.parentElement).not.toHaveTextContent('▲');
    expect(coltanLabel.parentElement).not.toHaveTextContent('▼');
    expect(diamondLabel.parentElement).not.toHaveTextContent('▲');
    expect(diamondLabel.parentElement).not.toHaveTextContent('▼');
  });

  it('shows Kinshasa time in the last-updated label', async () => {
    renderTicker();

    expect(await screen.findByText('MARCHÉ EN DIRECT')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Dernière mise à jour · 11:30/)).toBeInTheDocument();
    });
  });
});
