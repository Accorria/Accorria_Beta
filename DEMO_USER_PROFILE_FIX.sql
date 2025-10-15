-- Fix for Demo User Profile Issue
-- This creates a demo user in auth.users and corresponding profile to resolve foreign key constraint errors
-- Run this in your Supabase SQL Editor

-- Step 1: Create demo user in auth.users table
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000123'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'demo@accorria.com',
    crypt('demo123', gen_salt('bf')),
    NOW(),
    NOW(),
    '',
    NOW(),
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Demo", "last_name": "User", "full_name": "Demo User"}',
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Create demo user profile if it doesn't exist
INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    subscription_tier,
    posts_used,
    posts_limit,
    trial_ends_at,
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000123'::uuid,
    'demo@accorria.com',
    'Demo User',
    'free_trial',
    0,
    3,
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

-- Step 3: Verify the profile was created
SELECT 'Demo user profile created successfully!' as message, 
       id, email, full_name, subscription_tier 
FROM public.profiles 
WHERE id = '00000000-0000-0000-0000-000000000123'::uuid;
