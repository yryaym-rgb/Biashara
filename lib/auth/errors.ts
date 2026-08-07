/**
 * Maps Supabase Auth error messages to i18n keys under auth.errors.*
 * Justification: distinct honest messages — never one generic "error".
 */

export type AuthErrorKey =
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'userAlreadyExists'
  | 'weakPassword'
  | 'rateLimited'
  | 'unknown';

const ERROR_PATTERNS: Array<{ pattern: RegExp; key: AuthErrorKey }> = [
  { pattern: /invalid login credentials/i, key: 'invalidCredentials' },
  { pattern: /email not confirmed/i, key: 'emailNotConfirmed' },
  { pattern: /user already registered/i, key: 'userAlreadyExists' },
  { pattern: /password.*(weak|short|least)/i, key: 'weakPassword' },
  { pattern: /rate limit|too many requests/i, key: 'rateLimited' },
];

export function mapAuthError(message: string): AuthErrorKey {
  for (const { pattern, key } of ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return key;
    }
  }
  return 'unknown';
}
