/**
 * Input sanitization for user-generated content.
 * Justification: defense-in-depth against XSS in messages and listing descriptions.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
}

export function sanitizeText(input: string, maxLength = 5000): string {
  return escapeHtml(input.trim().slice(0, maxLength));
}

export function stripControlCharacters(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}
