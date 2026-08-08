import { describe, it, expect } from 'vitest';
import {
  KYC_REQUIREMENTS,
  getRequiredKycDocuments,
  hasAllRequiredKycDocuments,
  hasSubmittedAllRequiredKycDocuments,
} from '@/lib/constants/kyc-requirements';

describe('KYC requirements per role', () => {
  it('requires id_card for all transacting roles', () => {
    for (const role of ['buyer', 'seller', 'cooperative', 'institution'] as const) {
      expect(getRequiredKycDocuments(role)).toContain('id_card');
    }
  });

  it('maps seller to id_card and business_registration', () => {
    expect(getRequiredKycDocuments('seller')).toEqual(['id_card', 'business_registration']);
  });

  it('maps buyer to id_card only', () => {
    expect(getRequiredKycDocuments('buyer')).toEqual(['id_card']);
  });

  it('maps cooperative to id_card, business_registration, and mining_permit', () => {
    expect(getRequiredKycDocuments('cooperative')).toEqual([
      'id_card',
      'business_registration',
      'mining_permit',
    ]);
  });

  it('requires no documents for admin', () => {
    expect(getRequiredKycDocuments('admin')).toEqual([]);
  });

  it('reports complete when all required docs are approved', () => {
    expect(
      hasAllRequiredKycDocuments('cooperative', [
        'id_card',
        'business_registration',
        'mining_permit',
      ]),
    ).toBe(true);
    expect(
      hasAllRequiredKycDocuments('cooperative', ['id_card', 'business_registration']),
    ).toBe(false);
  });

  it('reports submitted when all required docs have rows (any status)', () => {
    expect(
      hasSubmittedAllRequiredKycDocuments('seller', ['id_card', 'business_registration']),
    ).toBe(true);
    expect(hasSubmittedAllRequiredKycDocuments('seller', ['id_card'])).toBe(false);
  });

  it('covers every user role in KYC_REQUIREMENTS', () => {
    const roles = ['buyer', 'seller', 'cooperative', 'institution', 'admin'] as const;
    for (const role of roles) {
      expect(KYC_REQUIREMENTS[role]).toBeDefined();
    }
  });
});
