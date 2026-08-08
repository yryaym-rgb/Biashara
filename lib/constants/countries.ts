/** ISO 3166-1 alpha-2 codes supported on profile settings. */
export const PROFILE_COUNTRY_CODES = [
  'CD',
  'CG',
  'AO',
  'RW',
  'BI',
  'UG',
  'TZ',
  'ZM',
  'CF',
  'GA',
  'CM',
  'KE',
  'ZA',
  'BE',
  'FR',
  'US',
  'CN',
] as const;

export type ProfileCountryCode = (typeof PROFILE_COUNTRY_CODES)[number];
