-- User Activity / LOI Tracking
-- Run in Supabase SQL Editor to track logins, vehicle searches, and key actions for admin/LOI reporting.

CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT,
    action_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_action_type ON public.user_activity(action_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_email ON public.user_activity(email);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_utm_source ON public.user_activity(utm_source);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- API routes use service role to insert and read
DROP POLICY IF EXISTS "Service role can insert activity" ON public.user_activity;
CREATE POLICY "Service role can insert activity" ON public.user_activity
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read activity" ON public.user_activity;
CREATE POLICY "Service role can read activity" ON public.user_activity
    FOR SELECT USING (auth.role() = 'service_role');

COMMENT ON TABLE public.user_activity IS 'Tracks logins, vehicle searches, and key actions for admin/LOI reporting';
