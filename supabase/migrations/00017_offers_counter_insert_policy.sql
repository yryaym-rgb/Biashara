-- Allow sellers and buyers to insert counter-offers in an existing negotiation chain.

CREATE POLICY offers_insert_counter ON public.offers
  FOR INSERT
  WITH CHECK (
    parent_offer_id IS NOT NULL
    AND buyer_id = (
      SELECT p.buyer_id FROM public.offers p WHERE p.id = parent_offer_id
    )
    AND EXISTS (
      SELECT 1
      FROM public.offers parent
      JOIN public.listings listing ON listing.id = parent.listing_id
      WHERE parent.id = parent_offer_id
        AND parent.status = 'pending'
        AND (
          listing.seller_id = auth.uid()
          OR parent.buyer_id = auth.uid()
        )
    )
  );
