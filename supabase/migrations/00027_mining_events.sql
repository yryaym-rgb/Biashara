-- BIASHARA: admin-authored mining sector calendar events (real data only — no seed rows)

CREATE TYPE public.mining_event_category AS ENUM (
  'auction',
  'government',
  'conference',
  'other'
);

CREATE TABLE public.mining_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT NOT NULL CHECK (char_length(trim(description)) > 0),
  event_date DATE NOT NULL,
  category public.mining_event_category NOT NULL,
  source_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER mining_events_updated_at
  BEFORE UPDATE ON public.mining_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_mining_events_event_date ON public.mining_events(event_date DESC);
CREATE INDEX idx_mining_events_category ON public.mining_events(category);

ALTER TABLE public.mining_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY mining_events_select_all ON public.mining_events
  FOR SELECT USING (true);

CREATE POLICY mining_events_insert_admin ON public.mining_events
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY mining_events_update_admin ON public.mining_events
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY mining_events_delete_admin ON public.mining_events
  FOR DELETE USING (public.is_admin());

CREATE TRIGGER audit_mining_events
  AFTER INSERT OR UPDATE OR DELETE ON public.mining_events
  FOR EACH ROW EXECUTE FUNCTION private.audit_log_changes();
