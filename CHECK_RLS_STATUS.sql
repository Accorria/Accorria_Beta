-- READ-ONLY: Check Current RLS Status
-- This script ONLY READS - it does NOT make any changes
-- Run this in Supabase SQL Editor to see what's already set up

-- ============================================
-- Check which tables have RLS enabled
-- ============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'profiles',
        'car_listings', 
        'car_analyses',
        'market_intelligence',
        'pricing_strategies',
        'content_generation',
        'messenger_interactions',
        'deals',
        'learning_data',
        'user_sessions',
        'user_platform_connections'
    )
ORDER BY tablename;

-- ============================================
-- Check existing RLS policies on car_listings (most important for photos)
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as "Operation",
    qual as "Using Expression",
    with_check as "With Check Expression"
FROM pg_policies 
WHERE tablename = 'car_listings'
ORDER BY policyname;

-- ============================================
-- Check existing RLS policies on profiles
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as "Operation"
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- Check existing RLS policies on car_analyses
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as "Operation"
FROM pg_policies 
WHERE tablename = 'car_analyses'
ORDER BY policyname;

-- ============================================
-- Check if car-images storage bucket exists
-- ============================================
SELECT 
    name as "Bucket Name",
    id as "Bucket ID",
    public as "Public",
    created_at,
    updated_at
FROM storage.buckets 
WHERE name = 'car-images';

-- ============================================
-- Check storage bucket policies
-- ============================================
-- NOTE: Storage policies cannot be queried via SQL
-- You must check them in Supabase Dashboard:
-- Go to: Storage > car-images bucket > Policies tab
-- 
-- Required policies for photo uploads:
-- 1. SELECT policy: Users can view their own images
-- 2. INSERT policy: Users can upload images  
-- 3. UPDATE policy: Users can update their own images
-- 4. DELETE policy: Users can delete their own images
--
-- Policy definition should be something like:
-- (bucket_id = 'car-images'::text) AND (auth.uid()::text = (storage.foldername(name))[1])

-- ============================================
-- Summary
-- ============================================
SELECT 
    'Summary' as info,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'car_listings', 'car_analyses') AND rowsecurity = true) as "Tables with RLS",
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'car_listings') as "car_listings Policies",
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as "profiles Policies",
    (SELECT COUNT(*) FROM storage.buckets WHERE name = 'car-images') as "car-images Bucket Exists";

