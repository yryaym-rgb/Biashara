/**
 * Resolves the name shown in the dashboard greeting.
 * Prefers company name; falls back to the email local-part (before @).
 */
export function getDashboardGreetingName(
  companyName: string | null,
  email: string | null,
  fallback: string,
): string {
  const trimmedCompany = companyName?.trim();
  if (trimmedCompany) {
    return trimmedCompany;
  }

  if (email) {
    const atIndex = email.indexOf('@');
    if (atIndex > 0) {
      return email.slice(0, atIndex);
    }
    return email;
  }

  return fallback;
}
