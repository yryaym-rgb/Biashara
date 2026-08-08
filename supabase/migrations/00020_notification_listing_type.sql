-- BIASHARA: extend notification_type enum for listing moderation events

ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'listing';
