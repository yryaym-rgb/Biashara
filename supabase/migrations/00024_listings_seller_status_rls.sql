-- BIASHARA: defense-in-depth — sellers cannot self-activate or set admin-only statuses

DROP POLICY IF EXISTS listings_update_own ON public.listings;

CREATE POLICY listings_update_own ON public.listings
  FOR UPDATE
  USING (seller_id = auth.uid() OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      seller_id = auth.uid()
      AND status NOT IN ('active', 'rejected', 'sold')
    )
  );
