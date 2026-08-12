import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

const { fetchMineralSearchCountsMock, pushMock } = vi.hoisted(() => ({
  fetchMineralSearchCountsMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock('@/lib/marketplace/mineral-search.client', () => ({
  fetchMineralSearchCounts: (...args: unknown[]) => fetchMineralSearchCountsMock(...args),
}));

vi.mock('@/lib/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next-intl', () => {
  const heroSearchLabels = {
    heading: 'RECHERCHER SUR LE MARCHÉ',
    placeholder: 'Rechercher un minerai, une région…',
    submit: 'Rechercher →',
    popularSearches: 'Recherches populaires',
    suggestionsLabel: 'Suggestions de minerais',
    loading: 'Recherche en cours…',
    suggestionCounts:
      '{mineral} — {activeCount} annonces actives · {supplierCount} fournisseurs vérifiés',
    suggestionActiveOnly: '{mineral} — {activeCount} annonces actives',
  };

  const mineralLabels = {
    cobalt: 'Cobalt',
    copper: 'Cuivre',
    gold: 'Or',
    coltan: 'Coltan',
    lithium: 'Lithium',
    diamond: 'Diamant',
  };

  const translate =
    (labels: Record<string, string>) =>
    (key: string, values?: Record<string, unknown>) => {
      const template = labels[key] ?? key;
      if (!values) {
        return template;
      }

      return template
        .replace('{mineral}', String(values.mineral ?? ''))
        .replace('{activeCount}', String(values.activeCount ?? ''))
        .replace('{supplierCount}', String(values.supplierCount ?? ''));
    };

  const heroSearchT = translate(heroSearchLabels);
  const mineralsT = translate(mineralLabels);

  return {
    useTranslations: (namespace: string) => {
      if (namespace === 'minerals') {
        return mineralsT;
      }
      return heroSearchT;
    },
  };
});

import { HeroQuickSearch } from '@/components/marketing/hero-quick-search';

describe('HeroQuickSearch', () => {
  beforeEach(() => {
    fetchMineralSearchCountsMock.mockResolvedValue([
      { mineralId: 'cobalt', activeListingCount: 4, verifiedSupplierCount: 2 },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the market search heading above the input', () => {
    render(<HeroQuickSearch />);
    expect(screen.getByText('RECHERCHER SUR LE MARCHÉ')).toBeInTheDocument();
  });

  it('fetches live counts after debounce and renders API results', async () => {
    render(<HeroQuickSearch />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'cob' } });
    expect(fetchMineralSearchCountsMock).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(fetchMineralSearchCountsMock).toHaveBeenCalledWith(
          ['cobalt'],
          expect.any(AbortSignal),
        );
      },
      { timeout: 1000 },
    );

    await waitFor(() => {
      expect(
        screen.getByRole('option', {
          name: 'COBALT — 4 annonces actives · 2 fournisseurs vérifiés',
        }),
      ).toBeInTheDocument();
    });
  });

  it('supports keyboard selection and navigates to the mineral filter', async () => {
    render(<HeroQuickSearch />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'cob' } });

    await waitFor(() => {
      expect(fetchMineralSearchCountsMock).toHaveBeenCalled();
    });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(pushMock).toHaveBeenCalledWith('/marketplace?mineral=cobalt');
  });

  it('closes suggestions on Escape', async () => {
    render(<HeroQuickSearch />);
    const input = screen.getByRole('combobox');

    fireEvent.change(input, { target: { value: 'cob' } });

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
