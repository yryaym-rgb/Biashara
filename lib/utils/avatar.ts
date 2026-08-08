/**
 * Derive avatar initials from company name (fallback to email).
 */
export function companyInitials(
  companyName: string | null | undefined,
  email: string | null | undefined,
): string {
  const name = companyName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0] ?? '';
      const second = parts[1] ?? '';
      return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
    }
    if (parts.length === 1) {
      const word = parts[0] ?? '';
      if (word.length >= 2) {
        return word.slice(0, 2).toUpperCase();
      }
      return word.charAt(0).toUpperCase();
    }
  }

  const mail = email?.trim();
  if (mail) {
    return mail.charAt(0).toUpperCase();
  }

  return '?';
}
