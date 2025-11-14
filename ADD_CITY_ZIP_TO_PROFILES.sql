-- Add city and zip_code columns to profiles table
-- This allows users to save their location during signup/onboarding
-- and auto-fill it when creating listings

-- Add columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.city IS 'User''s city (e.g., "Detroit", "Long Beach")';
COMMENT ON COLUMN public.profiles.zip_code IS 'User''s zip code (e.g., "48239", "90802")';
COMMENT ON COLUMN public.profiles.state IS 'User''s state (e.g., "MI", "CA")';

-- Note: RLS policies already exist for profiles table, so these columns are automatically protected

