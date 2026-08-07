-- BIASHARA: external metals price cache (15-min TTL enforced in API layer)

CREATE TABLE public.price_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mineral public.mineral_type NOT NULL UNIQUE,
  price NUMERIC(18, 4),
  currency TEXT NOT NULL DEFAULT 'USD',
  unit public.quantity_unit NOT NULL,
  price_type public.price_type NOT NULL DEFAULT 'fixed',
  source TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER price_cache_updated_at
  BEFORE UPDATE ON public.price_cache
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_price_cache_fetched_at ON public.price_cache(fetched_at DESC);
