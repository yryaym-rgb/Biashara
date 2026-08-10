-- BIASHARA: purchase requests (Demandes d'achat) with competitive private bids

CREATE TYPE public.rfp_status AS ENUM ('open', 'awarded', 'cancelled');

CREATE TYPE public.rfp_bid_status AS ENUM ('pending', 'selected', 'rejected');

CREATE TABLE public.rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  mineral public.mineral_type NOT NULL,
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  unit public.quantity_unit NOT NULL,
  target_price_min NUMERIC(18, 4) CHECK (target_price_min IS NULL OR target_price_min > 0),
  target_price_max NUMERIC(18, 4) CHECK (target_price_max IS NULL OR target_price_max > 0),
  delivery_terms TEXT,
  deadline DATE NOT NULL,
  description TEXT NOT NULL,
  status public.rfp_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rfps_target_price_range CHECK (
    target_price_min IS NULL
    OR target_price_max IS NULL
    OR target_price_max >= target_price_min
  )
);

CREATE TRIGGER rfps_updated_at
  BEFORE UPDATE ON public.rfps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_rfps_buyer_id ON public.rfps(buyer_id);
CREATE INDEX idx_rfps_status ON public.rfps(status);
CREATE INDEX idx_rfps_mineral ON public.rfps(mineral);
CREATE INDEX idx_rfps_deadline ON public.rfps(deadline);

CREATE TABLE public.rfp_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID NOT NULL REFERENCES public.rfps(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  offered_price NUMERIC(18, 4) NOT NULL CHECK (offered_price > 0),
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  delivery_terms TEXT,
  message TEXT,
  status public.rfp_bid_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rfp_id, seller_id)
);

CREATE TRIGGER rfp_bids_updated_at
  BEFORE UPDATE ON public.rfp_bids
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_rfp_bids_rfp_id ON public.rfp_bids(rfp_id);
CREATE INDEX idx_rfp_bids_seller_id ON public.rfp_bids(seller_id);
CREATE INDEX idx_rfp_bids_status ON public.rfp_bids(status);

ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'rfp';

-- Extend conversations for RFP award messaging (reuse existing messaging system)
ALTER TABLE public.conversations
  ALTER COLUMN listing_id DROP NOT NULL;

ALTER TABLE public.conversations
  ADD COLUMN rfp_id UUID REFERENCES public.rfps(id) ON DELETE RESTRICT;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_context_check CHECK (
    (listing_id IS NOT NULL AND rfp_id IS NULL)
    OR (listing_id IS NULL AND rfp_id IS NOT NULL)
  );

ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_listing_id_buyer_id_key;

CREATE UNIQUE INDEX conversations_listing_buyer_unique
  ON public.conversations(listing_id, buyer_id)
  WHERE listing_id IS NOT NULL;

CREATE UNIQUE INDEX conversations_rfp_seller_unique
  ON public.conversations(rfp_id, seller_id)
  WHERE rfp_id IS NOT NULL;

CREATE INDEX idx_conversations_rfp_id ON public.conversations(rfp_id);

-- RLS helpers
CREATE OR REPLACE FUNCTION public.is_rfp_buyer(p_rfp_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rfps
    WHERE id = p_rfp_id AND buyer_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.can_view_rfp_bid(p_bid_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rfp_bids b
    JOIN public.rfps r ON r.id = b.rfp_id
    WHERE b.id = p_bid_id
      AND (
        b.seller_id = auth.uid()
        OR r.buyer_id = auth.uid()
        OR public.is_admin()
      )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

ALTER TABLE public.rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfp_bids ENABLE ROW LEVEL SECURITY;

-- rfps: open requests are publicly readable (like active listings)
CREATE POLICY rfps_select ON public.rfps
  FOR SELECT USING (
    status = 'open'
    OR buyer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.rfp_bids b
      WHERE b.rfp_id = id AND b.seller_id = auth.uid()
    )
  );

CREATE POLICY rfps_insert_buyer ON public.rfps
  FOR INSERT WITH CHECK (
    buyer_id = auth.uid()
    AND public.is_kyc_approved()
    AND public.current_user_role() IN ('buyer', 'institution')
  );

CREATE POLICY rfps_update_own ON public.rfps
  FOR UPDATE USING (buyer_id = auth.uid() OR public.is_admin())
  WITH CHECK (buyer_id = auth.uid() OR public.is_admin());

-- rfp_bids: visible only to the RFP buyer, the bidding seller, and admin
CREATE POLICY rfp_bids_select ON public.rfp_bids
  FOR SELECT USING (
    seller_id = auth.uid()
    OR public.is_rfp_buyer(rfp_id)
    OR public.is_admin()
  );

CREATE POLICY rfp_bids_insert_seller ON public.rfp_bids
  FOR INSERT WITH CHECK (
    seller_id = auth.uid()
    AND public.is_kyc_approved()
    AND public.current_user_role() IN ('seller', 'cooperative')
    AND EXISTS (
      SELECT 1 FROM public.rfps r
      WHERE r.id = rfp_id AND r.status = 'open'
    )
  );

CREATE POLICY rfp_bids_update_buyer ON public.rfp_bids
  FOR UPDATE USING (public.is_rfp_buyer(rfp_id) OR public.is_admin())
  WITH CHECK (public.is_rfp_buyer(rfp_id) OR public.is_admin());

-- Buyer profile visibility for open RFPs (company name on public list)
CREATE POLICY profiles_select_open_rfp_buyers ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rfps r
      WHERE r.buyer_id = profiles.id AND r.status = 'open'
    )
  );

-- Seller profile visibility for RFP bid parties (buyer sees bidder names/KYC)
CREATE POLICY profiles_select_rfp_bid_parties ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rfp_bids b
      JOIN public.rfps r ON r.id = b.rfp_id
      WHERE b.seller_id = profiles.id
        AND (
          r.buyer_id = auth.uid()
          OR b.seller_id = auth.uid()
          OR public.is_admin()
        )
    )
  );
