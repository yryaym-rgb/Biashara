-- BIASHARA: order dispute fields and party-scoped update enforcement

ALTER TABLE public.orders
  ADD COLUMN dispute_reason TEXT,
  ADD COLUMN disputed_at TIMESTAMPTZ;

-- Order parties may read sold listings referenced by their orders (messaging context).
CREATE POLICY listings_select_order_party ON public.listings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.listing_id = listings.id
        AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.enforce_orders_party_update()
RETURNS TRIGGER AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.offer_id IS DISTINCT FROM OLD.offer_id
    OR NEW.listing_id IS DISTINCT FROM OLD.listing_id
    OR NEW.buyer_id IS DISTINCT FROM OLD.buyer_id
    OR NEW.seller_id IS DISTINCT FROM OLD.seller_id
    OR NEW.price_amount IS DISTINCT FROM OLD.price_amount
    OR NEW.quantity IS DISTINCT FROM OLD.quantity
    OR NEW.unit IS DISTINCT FROM OLD.unit
    OR NEW.currency IS DISTINCT FROM OLD.currency
  THEN
    RAISE EXCEPTION 'Cannot modify immutable order snapshot fields';
  END IF;

  IF auth.uid() = OLD.seller_id THEN
    IF (OLD.status, NEW.status) NOT IN (
      ('confirmed', 'processing'),
      ('processing', 'in_transit'),
      ('in_transit', 'delivered')
    ) THEN
      RAISE EXCEPTION 'Invalid order status progression';
    END IF;

    IF NEW.dispute_reason IS DISTINCT FROM OLD.dispute_reason
      OR NEW.disputed_at IS DISTINCT FROM OLD.disputed_at
    THEN
      RAISE EXCEPTION 'Seller cannot set dispute fields';
    END IF;

    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.buyer_id THEN
    IF OLD.status IN ('delivered', 'cancelled', 'disputed') THEN
      RAISE EXCEPTION 'Order cannot be disputed in status: %', OLD.status;
    END IF;

    IF NEW.status IS DISTINCT FROM 'disputed'::public.order_status THEN
      RAISE EXCEPTION 'Buyer may only set status to disputed';
    END IF;

    IF NEW.dispute_reason IS NULL OR btrim(NEW.dispute_reason) = '' THEN
      RAISE EXCEPTION 'Dispute reason is required';
    END IF;

    IF NEW.disputed_at IS NULL THEN
      RAISE EXCEPTION 'Disputed timestamp is required';
    END IF;

    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Unauthorized order update';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_orders_party_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_orders_party_update();
