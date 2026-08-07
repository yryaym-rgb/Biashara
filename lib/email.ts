import 'server-only';
import type { Locale } from '@/lib/i18n/config';
import fr from '@/messages/fr.json';
import en from '@/messages/en.json';

export type EmailTemplate = 'signup_confirmation' | 'password_reset' | 'kyc_approved' | 'kyc_rejected';

export interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  locale: Locale;
  data: Record<string, string>;
}

interface EmailContent {
  subject: string;
  text: string;
}

type EmailMessages = typeof fr.email;

const messagesByLocale: Record<Locale, EmailMessages> = {
  fr: fr.email,
  en: en.email,
};

function buildText(parts: string[]): string {
  return parts.filter(Boolean).join('\n\n');
}

function getEmailContent(template: EmailTemplate, locale: Locale): EmailContent {
  const messages = messagesByLocale[locale];

  switch (template) {
    case 'signup_confirmation': {
      const m = messages.signupConfirmation;
      return {
        subject: m.subject,
        text: buildText([m.greeting, m.body, m.footer]),
      };
    }
    case 'password_reset': {
      const m = messages.passwordReset;
      return {
        subject: m.subject,
        text: buildText([m.greeting, m.body, m.footer]),
      };
    }
    case 'kyc_approved': {
      const m = messages.kycApproved;
      return {
        subject: m.subject,
        text: buildText([m.greeting, m.body, m.cta]),
      };
    }
    case 'kyc_rejected': {
      const m = messages.kycRejected;
      return {
        subject: m.subject,
        text: buildText([m.greeting, m.body, m.cta]),
      };
    }
    default:
      return { subject: 'BIASHARA', text: '' };
  }
}

/**
 * Email abstraction — all outbound email goes through this module.
 * Phase 1: Supabase Auth handles transactional auth emails natively.
 * This wrapper logs intent and can be swapped to Resend/custom SMTP without touching call sites.
 */
export async function sendAuthEmail(options: SendEmailOptions): Promise<void> {
  const content = getEmailContent(options.template, options.locale);

  if (process.env.NODE_ENV === 'development') {
    console.info('[email]', options.template, options.to, options.locale);
    console.info('[email:subject]', content.subject);
    console.info('[email:body]', content.text);
  }
  // Supabase Auth sends signup/reset emails via its built-in provider.
  // Future: switch implementation here to Resend/SMTP for custom templates.
}

export async function sendTransactionalEmail(options: SendEmailOptions): Promise<void> {
  const content = getEmailContent(options.template, options.locale);

  if (process.env.NODE_ENV === 'development') {
    console.info('[email:transactional]', options.template, options.to, options.locale);
    console.info('[email:subject]', content.subject);
    console.info('[email:body]', content.text);
  }
}

export { getEmailContent };
