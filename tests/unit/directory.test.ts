import { describe, it, expect } from 'vitest';
import {
  collectDistinctMinerals,
  isDirectoryEligibleProfile,
  isDirectoryPublicRole,
  isPublicDirectoryProfile,
  pickPrimaryProvince,
} from '@/lib/directory/filters';
import { isPublicDirectoryRoute } from '@/lib/rbac';

describe('directory eligibility', () => {
  it('includes only KYC-approved public roles', () => {
    expect(
      isDirectoryEligibleProfile({ role: 'seller', kyc_status: 'approved' }),
    ).toBe(true);
    expect(
      isDirectoryEligibleProfile({ role: 'cooperative', kyc_status: 'approved' }),
    ).toBe(true);
    expect(
      isDirectoryEligibleProfile({ role: 'buyer', kyc_status: 'approved' }),
    ).toBe(true);
    expect(
      isDirectoryEligibleProfile({ role: 'institution', kyc_status: 'approved' }),
    ).toBe(true);
  });

  it('excludes admin accounts', () => {
    expect(
      isDirectoryEligibleProfile({ role: 'admin', kyc_status: 'approved' }),
    ).toBe(false);
  });

  it('excludes accounts with pending KYC even when role is set', () => {
    expect(
      isDirectoryEligibleProfile({ role: 'seller', kyc_status: 'pending' }),
    ).toBe(false);
    expect(
      isDirectoryEligibleProfile({ role: 'buyer', kyc_status: 'none' }),
    ).toBe(false);
    expect(
      isDirectoryEligibleProfile({ role: 'institution', kyc_status: 'rejected' }),
    ).toBe(false);
  });

  it('validates public directory roles', () => {
    expect(isDirectoryPublicRole('seller')).toBe(true);
    expect(isDirectoryPublicRole('admin')).toBe(false);
  });

  it('guards public directory profile shape', () => {
    expect(
      isPublicDirectoryProfile({
        id: '00000000-0000-4000-8000-000000000001',
        role: 'seller',
        company_name: 'Kivu Minerals',
        country: 'CD',
        kyc_status: 'approved',
        created_at: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe(true);

    expect(
      isPublicDirectoryProfile({
        id: '00000000-0000-4000-8000-000000000002',
        role: 'seller',
        company_name: 'Pending Seller',
        country: 'CD',
        kyc_status: 'pending',
        created_at: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe(false);
  });
});

describe('directory helpers', () => {
  it('collects distinct minerals in first-seen order', () => {
    expect(collectDistinctMinerals(['cobalt', 'copper', 'cobalt', 'gold'])).toEqual([
      'cobalt',
      'copper',
      'gold',
    ]);
  });

  it('picks the most frequent province', () => {
    expect(pickPrimaryProvince(['Lualaba', 'Haut-Katanga', 'Lualaba'])).toBe('Lualaba');
    expect(pickPrimaryProvince([])).toBeNull();
  });
});

describe('directory route access', () => {
  it('identifies public directory routes', () => {
    expect(isPublicDirectoryRoute('/directory')).toBe(true);
    expect(isPublicDirectoryRoute('/directory/00000000-0000-4000-8000-000000000001')).toBe(true);
    expect(isPublicDirectoryRoute('/en/directory')).toBe(true);
    expect(isPublicDirectoryRoute('/marketplace')).toBe(false);
  });
});
