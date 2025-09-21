-- Fix RLS policies for beta_signups table
-- This will allow public signups to work properly

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public signups" ON public.beta_signups;
DROP POLICY IF EXISTS "Allow service role read access" ON public.beta_signups;
DROP POLICY IF EXISTS "Allow service role update access" ON public.beta_signups;
DROP POLICY IF EXISTS "Allow service role insert access" ON public.beta_signups;

-- Create new policies that actually work
-- Allow anyone to insert (public signups)
CREATE POLICY "Allow public signups" ON public.beta_signups 
FOR INSERT 
WITH CHECK (true);

-- Allow service role to read all data
CREATE POLICY "Allow service role read access" ON public.beta_signups 
FOR SELECT 
USING (true);

-- Allow service role to update all data
CREATE POLICY "Allow service role update access" ON public.beta_signups 
FOR UPDATE 
USING (true);

-- Allow service role to insert data
CREATE POLICY "Allow service role insert access" ON public.beta_signups 
FOR INSERT 
WITH CHECK (true);

-- Grant necessary permissions to service_role
GRANT INSERT ON public.beta_signups TO service_role;
GRANT SELECT ON public.beta_signups TO service_role;
GRANT UPDATE ON public.beta_signups TO service_role;

-- Grant permissions to anon role for public signups
GRANT INSERT ON public.beta_signups TO anon;
GRANT SELECT ON public.beta_signups TO anon;

-- Verify the policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'beta_signups';
