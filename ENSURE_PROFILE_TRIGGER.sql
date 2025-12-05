-- Ensure Profile Creation Trigger Exists
-- Run this in Supabase SQL Editor to fix profile creation issues

-- Step 1: Create/Update the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use ON CONFLICT to handle cases where profile already exists
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    created_at, 
    updated_at,
    onboarding_complete
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      ''
    ),
    NOW(),
    NOW(),
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = COALESCE(EXCLUDED.email, profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Verify trigger exists
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

-- Step 4: Verify RLS policies allow profile creation
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
SELECT 'Profile trigger setup completed! The trigger will automatically create profiles when users sign up.' as message;

