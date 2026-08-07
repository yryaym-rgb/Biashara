import { describe, it, expect } from 'vitest';
import { DRC_MAP_REGIONS } from '@/lib/constants/drc-map';
import { DRC_PROVINCES } from '@/lib/constants/provinces';

describe('DRC map province deep-links', () => {
  it('map regions use exact marketplace origin_province filter values', () => {
    const mapProvinces = DRC_MAP_REGIONS.map((region) => region.province);

    for (const province of mapProvinces) {
      expect(DRC_PROVINCES).toContain(province);
    }

    expect(mapProvinces.length).toBe(DRC_PROVINCES.length);

    for (const province of DRC_PROVINCES) {
      expect(mapProvinces).toContain(province);
    }
  });

  it('province deep-link query values match filter enum exactly', () => {
    for (const { province } of DRC_MAP_REGIONS) {
      const deepLink = `/marketplace?province=${encodeURIComponent(province)}`;
      const decoded = new URL(decodeURIComponent(deepLink), 'http://localhost').searchParams.get(
        'province',
      );
      expect(decoded).toBe(province);
      expect(DRC_PROVINCES).toContain(decoded as typeof DRC_PROVINCES[number]);
    }
  });
});
