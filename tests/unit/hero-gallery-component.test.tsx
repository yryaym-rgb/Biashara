import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { HeroGallery } from '@/components/marketing/hero-gallery';
import type { ResolvedHeroGallerySlide } from '@/lib/constants/hero-gallery';

vi.mock('next/image', () => ({
  default: (props: { alt: string; src: string }) => <img alt={props.alt} src={props.src} />,
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { index?: number; total?: number }) => {
    if (key === 'heroGalleryDotLabel' && values) {
      return `Go to image ${values.index} of ${values.total}`;
    }
    return key;
  },
}));

const slides: ResolvedHeroGallerySlide[] = [
  {
    imagePath: '/images/hero-minerals.jpg',
    caption: 'Raw minerals from Katanga',
  },
  {
    imagePath: '/images/auth-mining.jpg',
    caption: 'Mining site in the DRC',
  },
];

describe('HeroGallery', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders only available slides without broken image paths', () => {
    render(<HeroGallery slides={slides} placeholderLabel="Hero image to be added" />);

    expect(screen.getByAltText('Raw minerals from Katanga')).toHaveAttribute(
      'src',
      '/images/hero-minerals.jpg',
    );
    expect(screen.getByAltText('Mining site in the DRC')).toHaveAttribute(
      'src',
      '/images/auth-mining.jpg',
    );
    expect(screen.queryByAltText('/images/gallery/cobalt-closeup.jpg')).not.toBeInTheDocument();
  });

  it('shows pagination dots for multiple slides', () => {
    render(<HeroGallery slides={slides} placeholderLabel="Hero image to be added" />);

    expect(screen.getByRole('button', { name: 'Go to image 1 of 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to image 2 of 2' })).toBeInTheDocument();
  });

  it('hides pagination dots for a single slide', () => {
    render(
      <HeroGallery
        slides={[slides[0]!]}
        placeholderLabel="Hero image to be added"
      />,
    );

    expect(screen.queryByRole('button', { name: /Go to image/ })).not.toBeInTheDocument();
  });

  it('renders placeholder when no slides are available', () => {
    render(<HeroGallery slides={[]} placeholderLabel="Hero image to be added" />);

    expect(screen.getByRole('img', { name: 'Hero image to be added' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Go to image/ })).not.toBeInTheDocument();
  });
});
