import 'server-only';
import type { Locale } from '@/lib/i18n/config';

export type EmailTemplate = 'signup_confirmation' | 'password_reset' | 'kyc_approved' | 'kyc_rejected';

export interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  locale: Locale;
  data: Record<string, string>;
}

/**
 * Email abstraction — all outbound email goes through this module.
 * Phase 1: Supabase Auth handles transactional auth emails natively.
 * This wrapper logs intent and can be swapped to Resend/custom SMTP without touching call sites.
 */
export async function sendAuthEmail(options: SendEmailOptions): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.info('[email]', options.template, options.to, options.locale);
  }
  // Supabase Auth sends signup/reset emails via its built-in provider.
  // Future: switch implementation here to Resend/SMTP for custom templates.
}

export async function sendTransactionalEmail(options: SendEmailOptions): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    console.info('[email:transactional]', options.template, options.to);
  }
}
