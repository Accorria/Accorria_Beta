-- Accorria Onboarding System - Database Schema
-- Run this in your Supabase SQL Editor

-- Step 1: Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'experienced')),
ADD COLUMN IF NOT EXISTS selected_category TEXT CHECK (selected_category IN ('automotive', 'real_estate', 'luxury_items', 'small_businesses', 'high_value_goods', 'art_collectibles')),
ADD COLUMN IF NOT EXISTS messaging_preference TEXT CHECK (messaging_preference IN ('auto_reply', 'human_in_loop', 'manual')),
ADD COLUMN IF NOT EXISTS wants_escrow BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.first_name IS 'User first name from onboarding';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name from onboarding';
COMMENT ON COLUMN public.profiles.zip IS 'User zip code from onboarding';
COMMENT ON COLUMN public.profiles.experience_level IS 'User marketplace experience level: beginner, intermediate, experienced';
COMMENT ON COLUMN public.profiles.selected_category IS 'Primary category user selected: automotive, real_estate, luxury_items, etc.';
COMMENT ON COLUMN public.profiles.messaging_preference IS 'How user wants to handle buyer messages: auto_reply, human_in_loop, manual';
COMMENT ON COLUMN public.profiles.wants_escrow IS 'Whether user wants escrow notifications';
COMMENT ON COLUMN public.profiles.onboarding_complete IS 'Whether user has completed onboarding flow';

-- Step 2: Create marketplace_integrations table (Admin/Master Switch System)
CREATE TABLE IF NOT EXISTS public.marketplace_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('automotive', 'real_estate', 'luxury_items', 'small_businesses', 'high_value_goods', 'art_collectibles')),
    status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN ('live', 'coming_soon', 'disabled')),
    icon_url TEXT,
    region TEXT,
    api_config JSONB DEFAULT '{}'::jsonb,
    requires_auth BOOLEAN DEFAULT true,
    enabled BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for marketplace_integrations
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_category ON public.marketplace_integrations(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_status ON public.marketplace_integrations(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_enabled ON public.marketplace_integrations(enabled);

-- Step 3: Create conversation_training_logs table (Backend Training Loop)
CREATE TABLE IF NOT EXISTS public.conversation_training_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES public.car_listings(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL CHECK (log_type IN ('user_edited_message', 'rejected_ai_draft', 'unanswered_question', 'manual_response')),
    original_ai_draft TEXT,
    user_edited_message TEXT,
    buyer_question TEXT,
    manual_response TEXT,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for conversation_training_logs
CREATE INDEX IF NOT EXISTS idx_training_logs_user_id ON public.conversation_training_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_logs_log_type ON public.conversation_training_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_training_logs_created_at ON public.conversation_training_logs(created_at);

-- Step 4: Enable Row Level Security
ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_training_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies

-- Marketplace integrations: Public read (for UI), Admin write
CREATE POLICY "Anyone can view enabled marketplace integrations" ON public.marketplace_integrations
    FOR SELECT USING (enabled = true);

CREATE POLICY "Service role can manage marketplace integrations" ON public.marketplace_integrations
    FOR ALL USING (auth.role() = 'service_role');

-- Conversation training logs: Users can only see their own logs
CREATE POLICY "Users can view own training logs" ON public.conversation_training_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training logs" ON public.conversation_training_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 6: Seed initial marketplace integrations data
INSERT INTO public.marketplace_integrations (name, category, status, icon_url, requires_auth, enabled, display_order) VALUES
-- Automotive - LIVE
('Facebook Marketplace', 'automotive', 'live', '📘', true, true, 1),
-- Automotive - COMING SOON
('AutoTrader', 'automotive', 'coming_soon', '🚗', true, true, 2),
('Cars.com', 'automotive', 'coming_soon', '🚙', true, true, 3),
('CarGurus', 'automotive', 'coming_soon', '🔍', true, true, 4),
('Craigslist', 'automotive', 'coming_soon', '📋', true, true, 5),
('OfferUp', 'automotive', 'coming_soon', '📱', true, true, 6),
('eBay Motors', 'automotive', 'coming_soon', '🛒', true, true, 7),
('Regional Marketplace Apps', 'automotive', 'coming_soon', '📍', true, true, 8),
-- Real Estate - COMING SOON
('Zillow', 'real_estate', 'coming_soon', '🏠', true, true, 1),
('Realtor.com', 'real_estate', 'coming_soon', '🏡', true, true, 2),
('Trulia', 'real_estate', 'coming_soon', '🏘️', true, true, 3),
('Redfin', 'real_estate', 'coming_soon', '🔴', true, true, 4),
('LoopNet', 'real_estate', 'coming_soon', '🏢', true, true, 5),
('Regional Marketplace Apps', 'real_estate', 'coming_soon', '📍', true, true, 6),
-- Luxury Items - COMING SOON
('StockX', 'luxury_items', 'coming_soon', '👟', true, true, 1),
('Grailed', 'luxury_items', 'coming_soon', '👔', true, true, 2),
('eBay Luxury', 'luxury_items', 'coming_soon', '💎', true, true, 3),
('Etsy', 'luxury_items', 'coming_soon', '🎨', true, true, 4),
('Regional Marketplace Apps', 'luxury_items', 'coming_soon', '📍', true, true, 5)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Onboarding database schema created successfully!' as message;

