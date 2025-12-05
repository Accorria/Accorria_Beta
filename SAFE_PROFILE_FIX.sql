-- Safe Profile Creation Fix
-- This checks if user exists before creating profile
-- Run this in your Supabase SQL Editor

-- Step 1: Check if the user exists in auth.users
-- Replace 'caf2aa6a-e2c0-4cf9-aa5d-4b3f23009fcf' with your actual user ID
DO $$
DECLARE
    user_id UUID := 'caf2aa6a-e2c0-4cf9-aa5d-4b3f23009fcf'::uuid;
    user_exists BOOLEAN;
    user_email TEXT;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
    SELECT email INTO user_email FROM auth.users WHERE id = user_id;
    
    IF NOT user_exists THEN
        RAISE NOTICE 'User % does not exist in auth.users. Cannot create profile.', user_id;
        RAISE NOTICE 'Please sign up again or use a valid user ID.';
        RETURN;
    END IF;
    
    -- User exists, create profile if it doesn't exist
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name,
        created_at, 
        updated_at,
        onboarding_complete
    )
    VALUES (
        user_id,
        COALESCE(user_email, ''),
        '',
        NOW(),
        NOW(),
        false
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        updated_at = NOW(),
        email = COALESCE(EXCLUDED.email, profiles.email);
    
    RAISE NOTICE 'Profile created/updated successfully for user %', user_id;
END $$;

-- Step 2: Verify the trigger exists and is enabled
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as enabled,
    CASE 
        WHEN tgenabled = 'O' THEN 'Enabled'
        WHEN tgenabled = 'D' THEN 'Disabled'
        ELSE 'Unknown'
    END as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Step 3: If trigger doesn't exist, create it
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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify RLS policies are correct
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
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Success message
SELECT 'Safe profile fix completed. Check the notices above for any issues.' as message;

