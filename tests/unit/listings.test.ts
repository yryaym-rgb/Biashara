import { describe, it, expect } from 'vitest';
import { LISTING_CREATE_STATUS } from '@/lib/marketplace/constants';

describe('createListing status on create', () => {
  it('starts listings in pending_review status', () => {
    expect(LISTING_CREATE_STATUS).toBe('pending_review');
  });
});
