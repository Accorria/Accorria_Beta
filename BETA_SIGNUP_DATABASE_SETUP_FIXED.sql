-- Beta Signup Tracking Database Setup - FIXED VERSION
-- Run this in your Supabase SQL Editor
-- This version handles existing objects properly

-- Step 1: Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public signups" ON public.beta_signups;
DROP POLICY IF EXISTS "Allow service role read access" ON public.beta_signups;
DROP POLICY IF EXISTS "Allow service role update access" ON public.beta_signups;

-- Step 2: Drop existing view if it exists
DROP VIEW IF EXISTS public.beta_signups_admin;

-- Step 3: Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_beta_signup_stats();

-- Step 4: Create beta_signups table (if not exists)
CREATE TABLE IF NOT EXISTS public.beta_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    source TEXT NOT NULL,
    focus TEXT NOT NULL DEFAULT 'cars',
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'active', 'declined'))
);

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON public.beta_signups(email);
CREATE INDEX IF NOT EXISTS idx_beta_signups_created_at ON public.beta_signups(created_at);
CREATE INDEX IF NOT EXISTS idx_beta_signups_status ON public.beta_signups(status);
CREATE INDEX IF NOT EXISTS idx_beta_signups_role ON public.beta_signups(role);

-- Step 6: Enable Row Level Security
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies (now that old ones are dropped)
CREATE POLICY "Allow public signups" ON public.beta_signups
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role read access" ON public.beta_signups
    FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role update access" ON public.beta_signups
    FOR UPDATE USING (auth.role() = 'service_role');

-- Step 8: Create admin dashboard view with SECURITY INVOKER
CREATE VIEW public.beta_signups_admin 
WITH (security_invoker = true) AS
SELECT 
    id,
    email,
    role,
    source,
    focus,
    status,
    created_at,
    updated_at,
    CASE 
        WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 'Recent'
        WHEN created_at >= NOW() - INTERVAL '7 days' THEN 'This Week'
        WHEN created_at >= NOW() - INTERVAL '30 days' THEN 'This Month'
        ELSE 'Older'
    END as signup_period
FROM public.beta_signups
ORDER BY created_at DESC;

-- Step 9: Grant access to the view
GRANT SELECT ON public.beta_signups_admin TO service_role;

-- Step 10: Create function with SECURITY INVOKER
CREATE FUNCTION public.get_beta_signup_stats()
RETURNS TABLE (
    total_signups BIGINT,
    pending_signups BIGINT,
    invited_signups BIGINT,
    active_signups BIGINT,
    signups_today BIGINT,
    signups_this_week BIGINT,
    signups_this_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_signups,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_signups,
        COUNT(*) FILTER (WHERE status = 'invited') as invited_signups,
        COUNT(*) FILTER (WHERE status = 'active') as active_signups,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as signups_today,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as signups_this_week,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as signups_this_month
    FROM public.beta_signups;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- Step 11: Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_beta_signup_stats() TO service_role;

-- Success message
SELECT 'Beta signup database setup completed successfully!' as status;
