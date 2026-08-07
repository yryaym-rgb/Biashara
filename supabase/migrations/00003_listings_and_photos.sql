-- BIASHARA: marketplace listings and photos

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  mineral public.mineral_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  grade TEXT,
  purity NUMERIC(5, 2) CHECK (purity IS NULL OR (purity >= 0 AND purity <= 100)),
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  unit public.quantity_unit NOT NULL,
  price_amount NUMERIC(18, 4),
  price_currency TEXT NOT NULL DEFAULT 'USD',
  price_type public.price_type NOT NULL DEFAULT 'negotiable',
  origin_province TEXT NOT NULL,
  certifications TEXT[] NOT NULL DEFAULT '{}',
  status public.listing_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_listings_status_mineral ON public.listings(status, mineral);
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);

CREATE TABLE public.listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_photos_listing_id ON public.listing_photos(listing_id);
