import 'server-only';

import fs from 'fs';
import path from 'path';
import {
  HERO_GALLERY_CANDIDATES,
  filterHeroGalleryCandidates,
  resolveHeroGallerySlide,
  type ResolvedHeroGallerySlide,
} from '@/lib/constants/hero-gallery';

function heroImageExists(imagePath: string): boolean {
  const relativePath = imagePath.replace(/^\//, '');
  return fs.existsSync(path.join(process.cwd(), 'public', relativePath));
}

export function getHeroGalleryImageStats(): { found: number; missing: number; total: number } {
  const available = filterHeroGalleryCandidates(HERO_GALLERY_CANDIDATES, heroImageExists);
  const total = HERO_GALLERY_CANDIDATES.length;
  const found = available.length;

  return {
    found,
    missing: total - found,
    total,
  };
}

export function getAvailableHeroGallerySlides(locale: string): ResolvedHeroGallerySlide[] {
  const available = filterHeroGalleryCandidates(HERO_GALLERY_CANDIDATES, heroImageExists);

  return available.map((slide) => resolveHeroGallerySlide(slide, locale));
}
