-- BIASHARA: private export readiness checklist (seller/cooperative self-tracking)

CREATE TYPE public.export_readiness_item_key AS ENUM (
  'ceec_certification',
  'export_permit',
  'taxes_paid',
  'customs_forms',
  'quality_certificates'
);

CREATE TABLE public.export_readiness_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_key public.export_readiness_item_key NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  document_id UUID REFERENCES public.kyc_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_key)
);

CREATE TRIGGER export_readiness_items_updated_at
  BEFORE UPDATE ON public.export_readiness_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_export_readiness_items_user_id ON public.export_readiness_items(user_id);

CREATE OR REPLACE FUNCTION public.validate_export_readiness_document()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.document_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.kyc_documents kd
      WHERE kd.id = NEW.document_id AND kd.user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'document_id must reference an owned kyc_document';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER export_readiness_items_validate_document
  BEFORE INSERT OR UPDATE ON public.export_readiness_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_export_readiness_document();

CREATE OR REPLACE FUNCTION public.sync_export_readiness_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_complete = true AND (TG_OP = 'INSERT' OR OLD.is_complete = false) THEN
    NEW.completed_at = COALESCE(NEW.completed_at, now());
  ELSIF NEW.is_complete = false THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER export_readiness_items_sync_completed_at
  BEFORE INSERT OR UPDATE ON public.export_readiness_items
  FOR EACH ROW EXECUTE FUNCTION public.sync_export_readiness_completed_at();

CREATE OR REPLACE FUNCTION public.is_seller_or_cooperative()
RETURNS BOOLEAN AS $$
  SELECT public.current_user_role() IN ('seller', 'cooperative');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

ALTER TABLE public.export_readiness_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY export_readiness_items_select ON public.export_readiness_items
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY export_readiness_items_insert ON public.export_readiness_items
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND public.is_seller_or_cooperative()
  );

CREATE POLICY export_readiness_items_update ON public.export_readiness_items
  FOR UPDATE USING (
    user_id = auth.uid()
    AND public.is_seller_or_cooperative()
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_seller_or_cooperative()
  );
