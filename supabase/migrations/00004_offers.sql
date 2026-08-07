-- BIASHARA: offer negotiation with counter-offer chains

CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  offered_price NUMERIC(18, 4) NOT NULL CHECK (offered_price > 0),
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  message TEXT,
  status public.offer_status NOT NULL DEFAULT 'pending',
  parent_offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_offers_listing_id ON public.offers(listing_id);
CREATE INDEX idx_offers_buyer_id ON public.offers(buyer_id);
CREATE INDEX idx_offers_parent_offer_id ON public.offers(parent_offer_id);
CREATE INDEX idx_offers_status ON public.offers(status);
