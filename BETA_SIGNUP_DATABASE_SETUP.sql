-- Beta Signup Tracking Database Setup
-- Run this in your Supabase SQL Editor

-- Create beta_signups table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON public.beta_signups(email);
CREATE INDEX IF NOT EXISTS idx_beta_signups_created_at ON public.beta_signups(created_at);
CREATE INDEX IF NOT EXISTS idx_beta_signups_status ON public.beta_signups(status);
CREATE INDEX IF NOT EXISTS idx_beta_signups_role ON public.beta_signups(role);

-- Enable Row Level Security
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow updates)
DROP POLICY IF EXISTS "Allow public signups" ON public.beta_signups;
DROP POLICY IF EXISTS "Allow service role read access" ON public.beta_signups;
DROP POLICY IF EXISTS "Allow service role update access" ON public.beta_signups;

-- Create policy to allow anyone to insert (for signups)
CREATE POLICY "Allow public signups" ON public.beta_signups
    FOR INSERT WITH CHECK (true);

-- Create policy to allow service role to read all (for admin dashboard)
CREATE POLICY "Allow service role read access" ON public.beta_signups
    FOR SELECT USING (auth.role() = 'service_role');

-- Create policy to allow service role to update (for status changes)
CREATE POLICY "Allow service role update access" ON public.beta_signups
    FOR UPDATE USING (auth.role() = 'service_role');

-- Create admin dashboard view (optional - for easier querying)
-- Explicitly set SECURITY INVOKER to avoid security definer issues
CREATE OR REPLACE VIEW public.beta_signups_admin 
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

-- Grant access to the view
GRANT SELECT ON public.beta_signups_admin TO service_role;

-- Create function to get signup stats
-- Using SECURITY INVOKER to respect RLS policies and avoid security definer issues
CREATE OR REPLACE FUNCTION public.get_beta_signup_stats()
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_beta_signup_stats() TO service_role;
