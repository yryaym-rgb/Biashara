-- BIASHARA: audit triggers on sensitive tables (append-only audit_log)

CREATE OR REPLACE FUNCTION private.audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_diff JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
    v_diff := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_diff := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_diff := to_jsonb(OLD);
  END IF;

  INSERT INTO public.audit_log (actor_id, action, entity, entity_id, diff)
  VALUES (
    auth.uid(),
    v_action,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_diff
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private;

CREATE TRIGGER audit_kyc_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.kyc_documents
  FOR EACH ROW EXECUTE FUNCTION private.audit_log_changes();

CREATE TRIGGER audit_listings
  AFTER INSERT OR UPDATE OR DELETE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION private.audit_log_changes();

CREATE TRIGGER audit_offers
  AFTER INSERT OR UPDATE OR DELETE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION private.audit_log_changes();

CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION private.audit_log_changes();
