-- Fix for Profile Creation Issue
-- This creates a trigger to automatically create a profile when a user signs up
-- Run this in your Supabase SQL Editor

-- Step 1: Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', ''),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free_trial',
    posts_used INTEGER DEFAULT 0,
    posts_limit INTEGER DEFAULT 3,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 6: Create car_listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.car_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    car_analysis_id UUID,
    pricing_strategy_id UUID,
    content_generation_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    platform VARCHAR,
    platform_listing_id VARCHAR,
    status VARCHAR DEFAULT 'draft',
    images TEXT[],
    flip_score INTEGER,
    pricing_strategy_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Enable RLS on car_listings
ALTER TABLE public.car_listings ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for car_listings
DROP POLICY IF EXISTS "Users can view own listings" ON public.car_listings;
CREATE POLICY "Users can view own listings" ON public.car_listings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own listings" ON public.car_listings;
CREATE POLICY "Users can insert own listings" ON public.car_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own listings" ON public.car_listings;
CREATE POLICY "Users can update own listings" ON public.car_listings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own listings" ON public.car_listings;
CREATE POLICY "Users can delete own listings" ON public.car_listings
    FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_car_listings_user_id ON public.car_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_car_listings_status ON public.car_listings(status);

-- Success message
SELECT 'Profile creation fix applied successfully! Users will now automatically get profiles when they sign up.' as message;
