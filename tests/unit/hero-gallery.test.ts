import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import {
  HERO_GALLERY_CANDIDATES,
  filterHeroGalleryCandidates,
  resolveHeroGallerySlide,
} from '@/lib/constants/hero-gallery';

describe('hero gallery constants', () => {
  it('defines 7 candidate slides', () => {
    expect(HERO_GALLERY_CANDIDATES).toHaveLength(7);
  });

  it('skips missing images gracefully', () => {
    const exists = (imagePath: string) => imagePath === '/images/hero-minerals.jpg';
    const available = filterHeroGalleryCandidates(HERO_GALLERY_CANDIDATES, exists);

    expect(available).toHaveLength(1);
    expect(available[0]?.imagePath).toBe('/images/hero-minerals.jpg');
    expect(available.every((slide) => exists(slide.imagePath))).toBe(true);
  });

  it('only includes files that exist on disk', () => {
    const available = filterHeroGalleryCandidates(HERO_GALLERY_CANDIDATES, (imagePath) =>
      fs.existsSync(path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''))),
    );

    expect(available).toHaveLength(HERO_GALLERY_CANDIDATES.length);
    expect(available.map((slide) => slide.imagePath)).toEqual(
      HERO_GALLERY_CANDIDATES.map((slide) => slide.imagePath),
    );
  });

  it('resolves captions by locale', () => {
    const slide = HERO_GALLERY_CANDIDATES[0];
    expect(slide).toBeDefined();

    if (!slide) {
      throw new Error('Expected first hero gallery slide to be defined');
    }

    expect(resolveHeroGallerySlide(slide, 'fr').caption).toBe(slide.captionFr);
    expect(resolveHeroGallerySlide(slide, 'en').caption).toBe(slide.captionEn);
  });
});
