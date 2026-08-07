import { describe, it, expect } from 'vitest';
import { listingCreateSchema } from '@/lib/validators/listing';

describe('listingCreateSchema', () => {
  const validListing = {
    mineral: 'cobalt',
    title: 'Cobalt concentrate grade A',
    description: 'High-grade cobalt concentrate from Lualaba province.',
    quantity: 50,
    unit: 'MT',
    priceType: 'negotiable',
    originProvince: 'Lualaba',
    certifications: [],
  };

  it('accepts valid listing input', () => {
    const result = listingCreateSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it('rejects invalid mineral', () => {
    const result = listingCreateSchema.safeParse({
      ...validListing,
      mineral: 'uranium',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = listingCreateSchema.safeParse({
      ...validListing,
      quantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects short title', () => {
    const result = listingCreateSchema.safeParse({
      ...validListing,
      title: 'AB',
    });
    expect(result.success).toBe(false);
  });
});
