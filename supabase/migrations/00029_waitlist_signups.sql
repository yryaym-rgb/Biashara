-- BIASHARA: BIASHARA AFRICA expansion waitlist (public signup via server action)

CREATE TABLE public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  country_interest TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_signups_email_unique UNIQUE (email)
);

CREATE INDEX waitlist_signups_created_at_idx ON public.waitlist_signups (created_at DESC);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.waitlist_signups FROM anon, authenticated, PUBLIC;
GRANT ALL ON public.waitlist_signups TO service_role;
