-- Delete meganb4739@gmail.com user from Accorria
-- Run this in Supabase SQL Editor

-- Step 1: Find the user ID
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'meganb4739@gmail.com';

-- Step 2: Delete from profiles table (this will cascade to related tables)
DELETE FROM public.profiles 
WHERE email = 'meganb4739@gmail.com';

-- Step 3: Delete from auth.users (Supabase auth table)
-- Note: You may need admin access. If this fails, delete via:
-- Supabase Dashboard → Authentication → Users → Find meganb4739@gmail.com → Delete
DELETE FROM auth.users 
WHERE email = 'meganb4739@gmail.com';

-- Step 4: Verify deletion
SELECT 'User deleted successfully!' as message
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'meganb4739@gmail.com'
);

-- Alternative: If you need to delete by user ID instead of email:
-- Replace 'USER_ID_HERE' with the actual UUID from Step 1
-- DELETE FROM public.profiles WHERE id = 'USER_ID_HERE';
-- DELETE FROM auth.users WHERE id = 'USER_ID_HERE';

