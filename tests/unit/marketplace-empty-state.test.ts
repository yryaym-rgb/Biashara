import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('marketplace empty state mineral tiles', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'components/marketplace/marketplace-empty-state.tsx'),
    'utf8',
  );

  it('does not attach numeric counts to mineral category tiles', () => {
    const start = source.indexOf('emptyCategoriesTitle');
    const end = source.indexOf('export async function', start + 1);
    const categoriesSection = source.slice(start, end > start ? end : undefined);

    expect(categoriesSection).toContain("t('emptyCategoryTag')");
    expect(categoriesSection).not.toMatch(/\{\s*count\s*[,}]/);
    expect(categoriesSection).not.toMatch(/plural/);
    expect(categoriesSection).not.toMatch(/offres?\s*(attendues|disponibles|actives)/i);
    expect(categoriesSection).not.toMatch(/>\s*\{[^}]*\d+[^}]*\}\s*</);
  });
});
