import { describe, it, expect } from 'vitest';
import { MINERALS, MINERAL_IDS, getMineralById } from '@/lib/constants/minerals';
import {
  getRequiredKycDocuments,
  hasAllRequiredKycDocuments,
} from '@/lib/constants/kyc-requirements';

describe('minerals constants', () => {
  it('defines exactly 6 minerals', () => {
    expect(MINERALS).toHaveLength(6);
    expect(MINERAL_IDS).toHaveLength(6);
  });

  it('marks coltan and diamond as no spot price', () => {
    expect(getMineralById('coltan').hasSpotPrice).toBe(false);
    expect(getMineralById('diamond').hasSpotPrice).toBe(false);
  });

  it('marks cobalt as having spot price', () => {
    expect(getMineralById('cobalt').hasSpotPrice).toBe(true);
  });
});

describe('kyc requirements', () => {
  it('requires mining_permit for cooperative only', () => {
    const cooperative = getRequiredKycDocuments('cooperative');
    const seller = getRequiredKycDocuments('seller');
    expect(cooperative).toContain('mining_permit');
    expect(seller).not.toContain('mining_permit');
  });

  it('validates all required docs are approved', () => {
    const sellerDocs = getRequiredKycDocuments('seller');
    expect(hasAllRequiredKycDocuments('seller', sellerDocs)).toBe(true);
    expect(hasAllRequiredKycDocuments('seller', ['id_card'])).toBe(false);
  });
});
