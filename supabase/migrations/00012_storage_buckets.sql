-- BIASHARA: storage buckets and policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('kyc-docs', 'kyc-docs', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('listing-photos', 'listing-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('contracts', 'contracts', false, 20971520, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- kyc-docs: owner read/write in own folder, admin read all
CREATE POLICY kyc_docs_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc-docs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY kyc_docs_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kyc-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY kyc_docs_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'kyc-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY kyc_docs_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'kyc-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- listing-photos: public read, owner write
CREATE POLICY listing_photos_select ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-photos');

CREATE POLICY listing_photos_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY listing_photos_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY listing_photos_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- contracts: order parties + admin (folder = order_id)
CREATE POLICY contracts_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contracts'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id::text = (storage.foldername(name))[1]
          AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
      )
    )
  );

CREATE POLICY contracts_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contracts'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id::text = (storage.foldername(name))[1]
          AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
      )
    )
  );

CREATE POLICY contracts_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'contracts'
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id::text = (storage.foldername(name))[1]
          AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
      )
    )
  );
