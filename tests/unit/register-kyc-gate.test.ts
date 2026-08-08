import { describe, it, expect } from 'vitest';
import {
  hasSubmittedAllRequiredKycDocuments,
} from '@/lib/constants/kyc-requirements';
import { evaluateRegisterStepGate } from '@/lib/auth/register-kyc-gate';

describe('hasSubmittedAllRequiredKycDocuments', () => {
  it('requires all document types for cooperative, not just approval', () => {
    expect(
      hasSubmittedAllRequiredKycDocuments('cooperative', [
        'id_card',
        'business_registration',
        'mining_permit',
      ]),
    ).toBe(true);
    expect(
      hasSubmittedAllRequiredKycDocuments('cooperative', ['id_card', 'business_registration']),
    ).toBe(false);
  });

  it('allows buyer with only id_card submitted', () => {
    expect(hasSubmittedAllRequiredKycDocuments('buyer', ['id_card'])).toBe(true);
    expect(hasSubmittedAllRequiredKycDocuments('buyer', [])).toBe(false);
  });
});

describe('evaluateRegisterStepGate', () => {
  const sellerContext = { userId: 'user-1', role: 'seller' as const };

  it('allows step 1 without registration context', () => {
    expect(evaluateRegisterStepGate(1, null, [])).toEqual({ allowed: true });
  });

  it('blocks step 2 without registration context', () => {
    expect(evaluateRegisterStepGate(2, null, [])).toEqual({
      allowed: false,
      redirectStep: 1,
    });
  });

  it('blocks step 3 URL bypass when no KYC documents submitted', () => {
    expect(evaluateRegisterStepGate(3, sellerContext, [])).toEqual({
      allowed: false,
      redirectStep: 2,
    });
  });

  it('blocks step 3 when only partial documents submitted for seller', () => {
    expect(evaluateRegisterStepGate(3, sellerContext, ['id_card'])).toEqual({
      allowed: false,
      redirectStep: 2,
    });
  });

  it('allows step 3 when all required documents are submitted', () => {
    expect(
      evaluateRegisterStepGate(3, sellerContext, ['id_card', 'business_registration']),
    ).toEqual({ allowed: true });
  });

  it('allows step 2 with context even when documents are missing', () => {
    expect(evaluateRegisterStepGate(2, sellerContext, [])).toEqual({ allowed: true });
  });
});
