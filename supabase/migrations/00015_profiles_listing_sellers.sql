-- Allow public read of seller profiles tied to active listings (company name, KYC badge on marketplace).

CREATE POLICY profiles_select_active_listing_sellers ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.seller_id = profiles.id
        AND l.status = 'active'
    )
  );
