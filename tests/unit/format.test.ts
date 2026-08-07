import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatPricePerUnit,
  resolveIntlLocale,
} from '@/lib/utils/format';

describe('resolveIntlLocale', () => {
  it('maps fr to fr-FR', () => {
    expect(resolveIntlLocale('fr')).toBe('fr-FR');
  });

  it('maps en to en-US', () => {
    expect(resolveIntlLocale('en')).toBe('en-US');
  });
});

describe('formatNumber', () => {
  it('uses French digit grouping for fr locale', () => {
    expect(formatNumber(33250, 'fr')).toBe('33\u202f250');
  });

  it('uses English digit grouping for en locale', () => {
    expect(formatNumber(33250, 'en')).toBe('33,250');
  });
});

describe('formatPricePerUnit', () => {
  it('formats French price with $US suffix', () => {
    expect(formatPricePerUnit(33250, 'USD', 'TM', 'fr')).toBe('33\u202f250 $US/TM');
  });

  it('formats English price with US$ suffix', () => {
    expect(formatPricePerUnit(33250, 'USD', 'MT', 'en')).toBe('33,250 US$/MT');
  });
});
