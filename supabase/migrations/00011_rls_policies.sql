-- BIASHARA: RLS helper functions and policies
-- Justification: read profiles.role directly to avoid stale JWT app_metadata claims.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_kyc_approved()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND kyc_status = 'approved'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_listing_seller(p_listing_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = p_listing_id AND seller_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_order_party(p_order_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE id = p_order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_traceability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL USING (public.is_admin());

-- kyc_documents
CREATE POLICY kyc_select ON public.kyc_documents
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY kyc_insert_own ON public.kyc_documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY kyc_update_admin ON public.kyc_documents
  FOR UPDATE USING (public.is_admin());

-- listings
CREATE POLICY listings_select_active ON public.listings
  FOR SELECT USING (
    status = 'active'
    OR seller_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY listings_insert_seller ON public.listings
  FOR INSERT WITH CHECK (
    seller_id = auth.uid()
    AND public.current_user_role() IN ('seller', 'cooperative')
    AND public.is_kyc_approved()
  );

CREATE POLICY listings_update_own ON public.listings
  FOR UPDATE USING (seller_id = auth.uid() OR public.is_admin())
  WITH CHECK (seller_id = auth.uid() OR public.is_admin());

CREATE POLICY listings_delete_draft ON public.listings
  FOR DELETE USING (
    seller_id = auth.uid() AND status = 'draft'
  );

-- listing_photos
CREATE POLICY listing_photos_select ON public.listing_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (l.status = 'active' OR l.seller_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY listing_photos_insert ON public.listing_photos
  FOR INSERT WITH CHECK (public.is_listing_seller(listing_id));

CREATE POLICY listing_photos_update ON public.listing_photos
  FOR UPDATE USING (public.is_listing_seller(listing_id));

CREATE POLICY listing_photos_delete ON public.listing_photos
  FOR DELETE USING (public.is_listing_seller(listing_id));

-- offers
CREATE POLICY offers_select_party ON public.offers
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.seller_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY offers_insert_buyer ON public.offers
  FOR INSERT WITH CHECK (
    buyer_id = auth.uid()
    AND public.is_kyc_approved()
    AND public.current_user_role() IN ('buyer', 'institution')
  );

CREATE POLICY offers_update_party ON public.offers
  FOR UPDATE USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.seller_id = auth.uid()
    )
    OR public.is_admin()
  );

-- orders
CREATE POLICY orders_select_party ON public.orders
  FOR SELECT USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY orders_update_party ON public.orders
  FOR UPDATE USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
    OR public.is_admin()
  );

-- contracts
CREATE POLICY contracts_select_party ON public.contracts
  FOR SELECT USING (
    public.is_order_party(order_id) OR public.is_admin()
  );

CREATE POLICY contracts_update_party ON public.contracts
  FOR UPDATE USING (
    public.is_order_party(order_id) OR public.is_admin()
  );

-- shipments
CREATE POLICY shipments_select_party ON public.shipments
  FOR SELECT USING (
    public.is_order_party(order_id) OR public.is_admin()
  );

CREATE POLICY shipments_insert_seller ON public.shipments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.seller_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY shipments_update_seller ON public.shipments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.seller_id = auth.uid() OR public.is_admin())
    )
  );

-- lot_traceability
CREATE POLICY lot_select ON public.lot_traceability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (l.seller_id = auth.uid() OR l.status = 'active' OR public.is_admin())
    )
  );

CREATE POLICY lot_insert_seller ON public.lot_traceability
  FOR INSERT WITH CHECK (public.is_listing_seller(listing_id));

-- custody_events (append-only)
CREATE POLICY custody_select ON public.custody_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lot_traceability lt
      JOIN public.listings l ON l.id = lt.listing_id
      WHERE lt.id = lot_id
        AND (l.seller_id = auth.uid() OR l.status = 'active' OR public.is_admin())
    )
  );

CREATE POLICY custody_insert ON public.custody_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lot_traceability lt
      JOIN public.listings l ON l.id = lt.listing_id
      WHERE lt.id = lot_id AND (l.seller_id = auth.uid() OR public.is_admin())
    )
  );

-- price_cache (public read, no client writes)
CREATE POLICY price_cache_select_all ON public.price_cache
  FOR SELECT USING (true);

-- conversations
CREATE POLICY conversations_select ON public.conversations
  FOR SELECT USING (
    buyer_id = auth.uid() OR seller_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY conversations_insert ON public.conversations
  FOR INSERT WITH CHECK (
    buyer_id = auth.uid() OR seller_id = auth.uid()
  );

-- messages
CREATE POLICY messages_select ON public.messages
  FOR SELECT USING (public.is_conversation_participant(conversation_id));

CREATE POLICY messages_insert ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_participant(conversation_id)
  );

CREATE POLICY messages_update_read ON public.messages
  FOR UPDATE USING (public.is_conversation_participant(conversation_id));

-- notifications
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- audit_log (admin read, insert via triggers only)
CREATE POLICY audit_log_select_admin ON public.audit_log
  FOR SELECT USING (public.is_admin());

-- Revoke direct writes on audit_log from authenticated users
REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM anon;
