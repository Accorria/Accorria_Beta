-- Simple Beta Signups Database Setup
-- Copy and paste this entire script into Supabase SQL Editor

-- Create the beta_signups table
CREATE TABLE IF NOT EXISTS public.beta_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL,
    source TEXT NOT NULL,
    focus TEXT NOT NULL DEFAULT 'cars',
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'active', 'declined'))
);

-- Enable Row Level Security
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for signups)
CREATE POLICY "Allow public signups" ON public.beta_signups
    FOR INSERT WITH CHECK (true);

-- Create policy to allow service role to read all (for admin dashboard)
CREATE POLICY "Allow service role read access" ON public.beta_signups
    FOR SELECT USING (auth.role() = 'service_role');

-- Create policy to allow service role to update (for status changes)
CREATE POLICY "Allow service role update access" ON public.beta_signups
    FOR UPDATE USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON public.beta_signups(email);
CREATE INDEX IF NOT EXISTS idx_beta_signups_created_at ON public.beta_signups(created_at);
CREATE INDEX IF NOT EXISTS idx_beta_signups_status ON public.beta_signups(status);

-- Success message
SELECT 'Beta signups table created successfully!' as message;
