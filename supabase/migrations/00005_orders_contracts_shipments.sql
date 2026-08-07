-- BIASHARA: orders, contracts, shipments
-- Orders are created ONLY via create_order_from_offer() SECURITY DEFINER function.

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL UNIQUE REFERENCES public.offers(id) ON DELETE RESTRICT,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  -- Immutable snapshot at acceptance
  price_amount NUMERIC(18, 4) NOT NULL,
  quantity NUMERIC(18, 4) NOT NULL,
  unit public.quantity_unit NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status public.order_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX idx_orders_status ON public.orders(status);

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
  storage_path TEXT,
  buyer_signed BOOLEAN NOT NULL DEFAULT false,
  seller_signed BOOLEAN NOT NULL DEFAULT false,
  buyer_signed_at TIMESTAMPTZ,
  seller_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  carrier TEXT,
  tracking_ref TEXT,
  status public.shipment_status NOT NULL DEFAULT 'pending',
  checkpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_shipments_order_id ON public.shipments(order_id);

-- Atomic order creation from accepted offer
CREATE OR REPLACE FUNCTION public.create_order_from_offer(p_offer_id UUID)
RETURNS UUID AS $$
DECLARE
  v_offer public.offers%ROWTYPE;
  v_listing public.listings%ROWTYPE;
  v_order_id UUID;
BEGIN
  SELECT * INTO v_offer FROM public.offers WHERE id = p_offer_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found: %', p_offer_id;
  END IF;

  IF v_offer.status NOT IN ('pending', 'countered') THEN
    RAISE EXCEPTION 'Offer cannot be accepted in status: %', v_offer.status;
  END IF;

  SELECT * INTO v_listing FROM public.listings WHERE id = v_offer.listing_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found for offer';
  END IF;

  IF v_listing.status != 'active' THEN
    RAISE EXCEPTION 'Listing is not active';
  END IF;

  -- Mark this offer accepted
  UPDATE public.offers SET status = 'accepted' WHERE id = p_offer_id;

  -- Expire sibling offers on same listing
  UPDATE public.offers
  SET status = 'expired'
  WHERE listing_id = v_offer.listing_id
    AND id != p_offer_id
    AND status IN ('pending', 'countered');

  -- Create order with snapshot
  INSERT INTO public.orders (
    offer_id, listing_id, buyer_id, seller_id,
    price_amount, quantity, unit, currency
  ) VALUES (
    v_offer.id, v_listing.id, v_offer.buyer_id, v_listing.seller_id,
    v_offer.offered_price, v_offer.quantity, v_listing.unit, v_listing.price_currency
  ) RETURNING id INTO v_order_id;

  -- Mark listing sold
  UPDATE public.listings SET status = 'sold' WHERE id = v_listing.id;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Only authenticated users can invoke; RLS on orders still applies for reads
GRANT EXECUTE ON FUNCTION public.create_order_from_offer(UUID) TO authenticated;
