-- Clear All Users from Database
-- Run this in Supabase SQL Editor
-- WARNING: This will delete ALL users and their data

-- Step 1: Delete from profiles table (this will cascade to related tables)
DELETE FROM public.profiles;

-- Step 2: Delete from auth.users (Supabase auth table)
-- Note: You may need to use the Supabase Dashboard → Authentication → Users to delete manually
-- Or use the Supabase API/Admin functions

-- Alternative: If you have admin access, you can delete users via:
-- Supabase Dashboard → Authentication → Users → Select All → Delete

-- Step 3: Clear any related data (optional, depending on your needs)
DELETE FROM public.car_listings;
DELETE FROM public.car_analyses;
DELETE FROM public.market_intelligence;
DELETE FROM public.pricing_strategies;
DELETE FROM public.content_generation;
DELETE FROM public.messenger_interactions;
DELETE FROM public.deals;
DELETE FROM public.learning_data;
DELETE FROM public.user_sessions;
DELETE FROM public.user_platform_connections;
DELETE FROM public.conversation_training_logs;

-- Step 4: Reset sequences (if using auto-increment IDs)
-- Note: UUIDs don't need sequence resets

-- Success message
SELECT 'All users and related data cleared!' as message;

