-- BIASHARA: extensions and shared utilities
-- Justification: pgcrypto for secure random; moddatetime for consistent updated_at triggers.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Private schema for security-definer helpers (not exposed via PostgREST)
CREATE SCHEMA IF NOT EXISTS private;

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enums
CREATE TYPE public.user_role AS ENUM (
  'buyer', 'seller', 'cooperative', 'admin', 'institution'
);

CREATE TYPE public.kyc_status AS ENUM (
  'none', 'pending', 'approved', 'rejected'
);

CREATE TYPE public.kyc_document_type AS ENUM (
  'id_card', 'business_registration', 'mining_permit', 'export_license'
);

CREATE TYPE public.kyc_document_status AS ENUM (
  'pending', 'approved', 'rejected'
);

CREATE TYPE public.mineral_type AS ENUM (
  'cobalt', 'copper', 'gold', 'coltan', 'lithium', 'diamond'
);

CREATE TYPE public.quantity_unit AS ENUM (
  'MT', 'oz', 'kg', 'carat'
);

CREATE TYPE public.price_type AS ENUM (
  'fixed', 'negotiable', 'indicative'
);

CREATE TYPE public.listing_status AS ENUM (
  'draft', 'pending_review', 'active', 'paused', 'sold', 'rejected'
);

CREATE TYPE public.offer_status AS ENUM (
  'pending', 'countered', 'accepted', 'declined', 'expired'
);

CREATE TYPE public.order_status AS ENUM (
  'confirmed', 'processing', 'in_transit', 'delivered', 'cancelled', 'disputed'
);

CREATE TYPE public.shipment_status AS ENUM (
  'pending', 'picked_up', 'in_transit', 'customs', 'delivered', 'exception'
);

CREATE TYPE public.notification_type AS ENUM (
  'kyc', 'offer', 'order', 'message', 'system'
);
