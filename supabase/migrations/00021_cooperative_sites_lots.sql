-- BIASHARA: cooperative mining sites and standalone lot traceability

CREATE TABLE public.cooperative_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  zea_reference TEXT NOT NULL,
  province TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER cooperative_sites_updated_at
  BEFORE UPDATE ON public.cooperative_sites
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_cooperative_sites_cooperative_id ON public.cooperative_sites(cooperative_id);

-- Lots can exist before a marketplace listing is linked
ALTER TABLE public.lot_traceability
  ALTER COLUMN listing_id DROP NOT NULL;

ALTER TABLE public.lot_traceability
  ADD COLUMN cooperative_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  ADD COLUMN mineral public.mineral_type,
  ADD COLUMN initial_weight_kg NUMERIC(12, 3),
  ADD COLUMN extraction_date DATE,
  ADD COLUMN notes TEXT,
  ADD COLUMN site_id UUID REFERENCES public.cooperative_sites(id) ON DELETE SET NULL;

ALTER TABLE public.lot_traceability
  DROP CONSTRAINT IF EXISTS lot_traceability_listing_id_key;

CREATE UNIQUE INDEX idx_lot_traceability_listing_id
  ON public.lot_traceability(listing_id)
  WHERE listing_id IS NOT NULL;

CREATE INDEX idx_lot_traceability_cooperative_id ON public.lot_traceability(cooperative_id);

ALTER TABLE public.lot_traceability
  ADD CONSTRAINT lot_traceability_initial_weight_positive
  CHECK (initial_weight_kg IS NULL OR initial_weight_kg > 0);

CREATE OR REPLACE FUNCTION public.is_cooperative_owner()
RETURNS BOOLEAN AS $$
  SELECT public.current_user_role() = 'cooperative' AND public.is_kyc_approved();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.owns_lot(p_lot_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lot_traceability lt
    WHERE lt.id = p_lot_id AND lt.cooperative_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_view_lot(p_lot_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lot_traceability lt
    LEFT JOIN public.listings l ON l.id = lt.listing_id
    WHERE lt.id = p_lot_id
      AND (
        lt.cooperative_id = auth.uid()
        OR public.is_admin()
        OR (lt.listing_id IS NOT NULL AND l.status = 'active')
      )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

ALTER TABLE public.cooperative_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY cooperative_sites_select_own ON public.cooperative_sites
  FOR SELECT USING (cooperative_id = auth.uid() OR public.is_admin());

CREATE POLICY cooperative_sites_insert ON public.cooperative_sites
  FOR INSERT WITH CHECK (
    cooperative_id = auth.uid()
    AND public.is_cooperative_owner()
  );

CREATE POLICY cooperative_sites_update ON public.cooperative_sites
  FOR UPDATE USING (cooperative_id = auth.uid() AND public.is_cooperative_owner())
  WITH CHECK (cooperative_id = auth.uid() AND public.is_cooperative_owner());

CREATE POLICY cooperative_sites_delete ON public.cooperative_sites
  FOR DELETE USING (cooperative_id = auth.uid() AND public.is_cooperative_owner());

DROP POLICY IF EXISTS lot_select ON public.lot_traceability;
DROP POLICY IF EXISTS lot_insert_seller ON public.lot_traceability;

CREATE POLICY lot_select ON public.lot_traceability
  FOR SELECT USING (public.can_view_lot(id));

CREATE POLICY lot_insert_cooperative ON public.lot_traceability
  FOR INSERT WITH CHECK (
    cooperative_id = auth.uid()
    AND public.is_cooperative_owner()
  );

CREATE POLICY lot_update_cooperative ON public.lot_traceability
  FOR UPDATE USING (
    cooperative_id = auth.uid() AND public.is_cooperative_owner()
  )
  WITH CHECK (
    cooperative_id = auth.uid() AND public.is_cooperative_owner()
  );

DROP POLICY IF EXISTS custody_select ON public.custody_events;
DROP POLICY IF EXISTS custody_insert ON public.custody_events;

CREATE POLICY custody_select ON public.custody_events
  FOR SELECT USING (public.can_view_lot(lot_id));

CREATE POLICY custody_insert ON public.custody_events
  FOR INSERT WITH CHECK (
    public.owns_lot(lot_id)
    AND public.is_cooperative_owner()
  );
