import { describe, it, expect } from 'vitest';
import { companyInitials } from '@/lib/utils/avatar';

describe('companyInitials', () => {
  it('uses first letters of first two words from company name', () => {
    expect(companyInitials('ABC Mining Corp', 'user@example.com')).toBe('AM');
  });

  it('uses first two letters for single-word company name', () => {
    expect(companyInitials('Biashara', 'user@example.com')).toBe('BI');
  });

  it('falls back to email when company name is empty', () => {
    expect(companyInitials(null, 'user@example.com')).toBe('U');
    expect(companyInitials('', 'user@example.com')).toBe('U');
  });

  it('returns question mark when neither company nor email is available', () => {
    expect(companyInitials(null, null)).toBe('?');
  });
});
