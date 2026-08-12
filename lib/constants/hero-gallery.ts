export interface HeroGallerySlide {
  imagePath: string;
  captionFr: string;
  captionEn: string;
}

export interface ResolvedHeroGallerySlide {
  imagePath: string;
  caption: string;
}

export const HERO_GALLERY_CANDIDATES: readonly HeroGallerySlide[] = [
  {
    imagePath: '/images/hero-minerals.jpg',
    captionFr: 'Minerais bruts du Katanga',
    captionEn: 'Raw minerals from Katanga',
  },
  {
    imagePath: '/images/auth-mining.jpg',
    captionFr: "Site d'extraction en RDC",
    captionEn: 'Mining site in the DRC',
  },
  {
    imagePath: '/images/gallery/cobalt-closeup.jpg',
    captionFr: 'Cobalt brut',
    captionEn: 'Raw cobalt',
  },
  {
    imagePath: '/images/gallery/copper-closeup.jpg',
    captionFr: 'Cuivre et malachite',
    captionEn: 'Copper and malachite',
  },
  {
    imagePath: '/images/gallery/collection-point.jpg',
    captionFr: 'Point de collecte',
    captionEn: 'Collection point',
  },
  {
    imagePath: '/images/gallery/transport.jpg',
    captionFr: 'Transport vers les marchés',
    captionEn: 'Transport to market',
  },
  {
    imagePath: '/images/gallery/quality-check.jpg',
    captionFr: 'Contrôle qualité',
    captionEn: 'Quality inspection',
  },
] as const;

export function filterHeroGalleryCandidates(
  candidates: readonly HeroGallerySlide[],
  exists: (imagePath: string) => boolean,
): HeroGallerySlide[] {
  return candidates.filter((entry) => exists(entry.imagePath));
}

export function resolveHeroGallerySlide(
  slide: HeroGallerySlide,
  locale: string,
): ResolvedHeroGallerySlide {
  return {
    imagePath: slide.imagePath,
    caption: locale === 'en' ? slide.captionEn : slide.captionFr,
  };
}
