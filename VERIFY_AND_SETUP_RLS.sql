-- Comprehensive RLS Policy Verification and Setup Script
-- Run this in Supabase SQL Editor to verify and set up all RLS policies

-- ============================================
-- STEP 1: Verify Tables Exist
-- ============================================

-- Check if profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE EXCEPTION 'profiles table does not exist';
    END IF;
END $$;

-- Check if car_listings table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'car_listings') THEN
        RAISE EXCEPTION 'car_listings table does not exist';
    END IF;
END $$;

-- Check if car_analyses table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'car_analyses') THEN
        RAISE EXCEPTION 'car_analyses table does not exist';
    END IF;
END $$;

-- ============================================
-- STEP 2: Enable RLS on All Tables
-- ============================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.car_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pricing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.content_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messenger_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_platform_connections ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Drop Existing Policies (Clean Slate)
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Car listings
DROP POLICY IF EXISTS "Users can view own listings" ON public.car_listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON public.car_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.car_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON public.car_listings;

-- Car analyses
DROP POLICY IF EXISTS "Users can view own car analyses" ON public.car_analyses;
DROP POLICY IF EXISTS "Users can insert own car analyses" ON public.car_analyses;
DROP POLICY IF EXISTS "Users can update own car analyses" ON public.car_analyses;

-- Market intelligence
DROP POLICY IF EXISTS "Users can view own market intelligence" ON public.market_intelligence;
DROP POLICY IF EXISTS "Users can insert own market intelligence" ON public.market_intelligence;

-- Pricing strategies
DROP POLICY IF EXISTS "Users can view own pricing strategies" ON public.pricing_strategies;
DROP POLICY IF EXISTS "Users can insert own pricing strategies" ON public.pricing_strategies;

-- Content generation
DROP POLICY IF EXISTS "Users can view own content generation" ON public.content_generation;
DROP POLICY IF EXISTS "Users can insert own content generation" ON public.content_generation;

-- Messenger interactions
DROP POLICY IF EXISTS "Users can view own messenger interactions" ON public.messenger_interactions;
DROP POLICY IF EXISTS "Users can insert own messenger interactions" ON public.messenger_interactions;

-- Deals
DROP POLICY IF EXISTS "Users can view own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can insert own deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update own deals" ON public.deals;

-- Learning data
DROP POLICY IF EXISTS "Users can view own learning data" ON public.learning_data;
DROP POLICY IF EXISTS "Users can insert own learning data" ON public.learning_data;

-- User platform connections
DROP POLICY IF EXISTS "Users can view own platform connections" ON public.user_platform_connections;
DROP POLICY IF EXISTS "Users can insert own platform connections" ON public.user_platform_connections;
DROP POLICY IF EXISTS "Users can update own platform connections" ON public.user_platform_connections;

-- ============================================
-- STEP 4: Create RLS Policies
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Car listings policies (CRITICAL FOR PHOTO UPLOADS)
CREATE POLICY "Users can view own listings" ON public.car_listings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listings" ON public.car_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON public.car_listings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON public.car_listings
    FOR DELETE USING (auth.uid() = user_id);

-- Car analyses policies
CREATE POLICY "Users can view own car analyses" ON public.car_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own car analyses" ON public.car_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own car analyses" ON public.car_analyses
    FOR UPDATE USING (auth.uid() = user_id);

-- Market intelligence policies
CREATE POLICY "Users can view own market intelligence" ON public.market_intelligence
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own market intelligence" ON public.market_intelligence
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pricing strategies policies
CREATE POLICY "Users can view own pricing strategies" ON public.pricing_strategies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pricing strategies" ON public.pricing_strategies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Content generation policies
CREATE POLICY "Users can view own content generation" ON public.content_generation
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content generation" ON public.content_generation
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messenger interactions policies
CREATE POLICY "Users can view own messenger interactions" ON public.messenger_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messenger interactions" ON public.messenger_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Deals policies
CREATE POLICY "Users can view own deals" ON public.deals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deals" ON public.deals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals" ON public.deals
    FOR UPDATE USING (auth.uid() = user_id);

-- Learning data policies
CREATE POLICY "Users can view own learning data" ON public.learning_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning data" ON public.learning_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User platform connections policies
CREATE POLICY "Users can view own platform connections" ON public.user_platform_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own platform connections" ON public.user_platform_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platform connections" ON public.user_platform_connections
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: Verify Policies Were Created
-- ============================================

-- Check policies on car_listings (most important for photo uploads)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'car_listings'
ORDER BY policyname;

-- ============================================
-- STEP 6: Storage Bucket Policies (car-images)
-- ============================================
-- NOTE: Storage policies must be set up in Supabase Dashboard > Storage
-- Go to Storage > car-images bucket > Policies tab
-- 
-- Required policies:
-- 1. SELECT: Users can view their own images
--    Policy: (bucket_id = 'car-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
-- 
-- 2. INSERT: Users can upload images
--    Policy: (bucket_id = 'car-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
-- 
-- 3. UPDATE: Users can update their own images
--    Policy: (bucket_id = 'car-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)
-- 
-- 4. DELETE: Users can delete their own images
--    Policy: (bucket_id = 'car-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies have been set up successfully!';
    RAISE NOTICE '⚠️  IMPORTANT: Don''t forget to set up Storage bucket policies in Supabase Dashboard!';
    RAISE NOTICE '    Go to: Storage > car-images > Policies';
END $$;

