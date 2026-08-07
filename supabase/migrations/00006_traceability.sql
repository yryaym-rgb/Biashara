-- BIASHARA: lot traceability with human-readable codes

CREATE TABLE private.lot_code_sequences (
  mineral_code TEXT NOT NULL,
  year INT NOT NULL,
  last_value INT NOT NULL DEFAULT 0,
  PRIMARY KEY (mineral_code, year)
);

CREATE TABLE public.lot_traceability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL UNIQUE REFERENCES public.listings(id) ON DELETE RESTRICT,
  lot_code TEXT NOT NULL UNIQUE,
  origin_mine TEXT,
  origin_province TEXT NOT NULL,
  origin_country TEXT NOT NULL DEFAULT 'CD',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lot_traceability_lot_code ON public.lot_traceability(lot_code);

CREATE TABLE public.custody_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES public.lot_traceability(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  location TEXT,
  notes TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_custody_events_lot_id ON public.custody_events(lot_id, occurred_at);

-- Generate lot code: BIA-CB-2026-000001
CREATE OR REPLACE FUNCTION public.generate_lot_code(p_mineral public.mineral_type)
RETURNS TEXT AS $$
DECLARE
  v_mineral_code TEXT;
  v_year INT;
  v_next INT;
BEGIN
  v_mineral_code := CASE p_mineral
    WHEN 'cobalt' THEN 'CB'
    WHEN 'copper' THEN 'CU'
    WHEN 'gold' THEN 'AU'
    WHEN 'coltan' THEN 'CT'
    WHEN 'lithium' THEN 'LI'
    WHEN 'diamond' THEN 'DM'
  END;

  v_year := EXTRACT(YEAR FROM now())::INT;

  INSERT INTO private.lot_code_sequences (mineral_code, year, last_value)
  VALUES (v_mineral_code, v_year, 1)
  ON CONFLICT (mineral_code, year)
  DO UPDATE SET last_value = private.lot_code_sequences.last_value + 1
  RETURNING last_value INTO v_next;

  RETURN format('BIA-%s-%s-%s', v_mineral_code, v_year, lpad(v_next::TEXT, 6, '0'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private;

GRANT EXECUTE ON FUNCTION public.generate_lot_code(public.mineral_type) TO authenticated;
