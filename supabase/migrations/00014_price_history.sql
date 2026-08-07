-- BIASHARA: daily price history for market trend charts

CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mineral public.mineral_type NOT NULL,
  price NUMERIC(18, 4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT price_history_mineral_date_unique UNIQUE (mineral, recorded_date)
);

CREATE INDEX idx_price_history_mineral_recorded_date
  ON public.price_history (mineral, recorded_date DESC);
