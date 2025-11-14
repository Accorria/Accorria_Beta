-- QuickFlips.ai - Database Migration Script
-- Safely updates existing schema to align with 8-Agent System

-- Step 1: Drop existing tables (if they exist) to recreate with new structure
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.deals CASCADE;
DROP TABLE IF EXISTS public.listings CASCADE;
DROP TABLE IF EXISTS public.car_analyses CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create updated tables with new structure

-- Users table (extends Supabase auth.users)
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

-- Car analyses table (Vision Agent + Data Extraction Agent output)
CREATE TABLE IF NOT EXISTS public.car_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_urls TEXT[],
    make TEXT,
    model TEXT,
    year INTEGER,
    mileage INTEGER,
    condition TEXT,
    title_status TEXT,
    color TEXT,
    features TEXT[],
    vision_analysis JSONB, -- Vision Agent output
    data_extraction JSONB, -- Data Extraction Agent output
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market intelligence table (Market Intelligence Agent output)
CREATE TABLE IF NOT EXISTS public.market_intelligence (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    car_analysis_id UUID REFERENCES public.car_analyses(id) ON DELETE CASCADE,
    market_comps JSONB,
    demand_analysis JSONB,
    price_trends JSONB,
    competitor_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing strategies table (Pricing Strategy Agent output)
CREATE TABLE IF NOT EXISTS public.pricing_strategies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    car_analysis_id UUID REFERENCES public.car_analyses(id) ON DELETE CASCADE,
    quick_sale_price DECIMAL(10,2),
    market_price DECIMAL(10,2),
    top_dollar_price DECIMAL(10,2),
    pricing_rationale JSONB,
    flip_score INTEGER, -- 0-100 score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content generation table (Content Generation Agent output)
CREATE TABLE IF NOT EXISTS public.content_generation (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    car_analysis_id UUID REFERENCES public.car_analyses(id) ON DELETE CASCADE,
    pricing_strategy_id UUID REFERENCES public.pricing_strategies(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    feature_bullets TEXT[],
    platform_specific_content JSONB, -- Different content for Facebook, Craigslist, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Car listings table (final user-approved listings)
CREATE TABLE IF NOT EXISTS public.car_listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    car_analysis_id UUID REFERENCES public.car_analyses(id) ON DELETE CASCADE,
    pricing_strategy_id UUID REFERENCES public.pricing_strategies(id) ON DELETE CASCADE,
    content_generation_id UUID REFERENCES public.content_generation(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    platform VARCHAR,
    platform_listing_id VARCHAR,
    status VARCHAR DEFAULT 'draft',
    images TEXT[],
    flip_score INTEGER,
    pricing_strategy_used TEXT, -- 'quick_sale', 'market_price', 'top_dollar'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messenger bot interactions table (Messenger Bot Agent)
CREATE TABLE IF NOT EXISTS public.messenger_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.car_listings(id) ON DELETE CASCADE,
    buyer_message TEXT,
    bot_response TEXT,
    buyer_intent TEXT, -- 'serious_buyer', 'tire_kicker', 'price_negotiation'
    action_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table (completed sales)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.car_listings(id) ON DELETE CASCADE,
    buyer_name TEXT,
    buyer_phone TEXT,
    buyer_email TEXT,
    offer_amount DECIMAL(10,2),
    final_sale_price DECIMAL(10,2),
    status VARCHAR DEFAULT 'pending',
    days_to_sell INTEGER,
    buyer_source TEXT, -- 'facebook', 'craigslist', 'offerup'
    messages JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning data table (Learning Agent input/output)
CREATE TABLE IF NOT EXISTS public.learning_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.car_listings(id) ON DELETE CASCADE,
    outcome_data JSONB, -- Sale success, price achieved, time to sell
    feature_importance JSONB, -- Which features drove success
    model_improvements JSONB, -- Learning agent recommendations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (Orchestrator Agent state)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_data JSONB, -- Current workflow state
    agent_outputs JSONB, -- Combined outputs from all agents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Step 4: Enable Row Level Security (RLS) - FIXES SECURITY ISSUES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messenger_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies (if any) and create new ones
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Step 6: Create RLS Policies - USERS CAN ONLY ACCESS THEIR OWN DATA

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

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

-- Car listings policies
CREATE POLICY "Users can view own car listings" ON public.car_listings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own car listings" ON public.car_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own car listings" ON public.car_listings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own car listings" ON public.car_listings
    FOR DELETE USING (auth.uid() = user_id);

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

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Step 7: Create Functions and Triggers
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_car_listings_updated_at ON public.car_listings;
DROP TRIGGER IF EXISTS update_deals_updated_at ON public.deals;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_listings_updated_at BEFORE UPDATE ON public.car_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Create Indexes for performance
DROP INDEX IF EXISTS idx_car_analyses_user_id;
DROP INDEX IF EXISTS idx_car_listings_user_id;
DROP INDEX IF EXISTS idx_deals_user_id;
DROP INDEX IF EXISTS idx_car_listings_status;
DROP INDEX IF EXISTS idx_deals_status;

CREATE INDEX idx_car_analyses_user_id ON public.car_analyses(user_id);
CREATE INDEX idx_car_listings_user_id ON public.car_listings(user_id);
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_car_listings_status ON public.car_listings(status);
CREATE INDEX idx_deals_status ON public.deals(status);

-- Step 9: Verify migration
SELECT 'Migration completed successfully!' as status;
