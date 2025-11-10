-- ACCORRIA — AUDIT USER SETUP SCRIPT
-- CONFIDENTIAL — For Bizionic Audit Use Only
-- 
-- This script creates a read-only database user for the audit
-- Run this script as a Supabase admin/superuser

-- Step 1: Create read-only role (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'read_only') THEN
        CREATE ROLE read_only;
        COMMENT ON ROLE read_only IS 'Read-only role for audit purposes';
    END IF;
END
$$;

-- Step 2: Grant connect privilege
GRANT CONNECT ON DATABASE postgres TO read_only;

-- Step 3: Grant usage on public schema
GRANT USAGE ON SCHEMA public TO read_only;

-- Step 4: Grant SELECT on non-PII tables only
-- Excluded: auth.users, profiles, user_platform_connections (PII tables)

-- Core analysis tables (non-PII)
GRANT SELECT ON public.car_analyses TO read_only;
GRANT SELECT ON public.market_intelligence TO read_only;
GRANT SELECT ON public.pricing_strategies TO read_only;
GRANT SELECT ON public.content_generation TO read_only;

-- Listings (user_id only, no PII)
GRANT SELECT ON public.listings TO read_only;

-- Deals (contains buyer PII - consider excluding or masking)
-- GRANT SELECT ON public.deals TO read_only;  -- COMMENTED: Contains buyer PII

-- Messenger interactions (may contain PII in messages)
-- GRANT SELECT ON public.messenger_interactions TO read_only;  -- COMMENTED: May contain PII

-- Learning data (non-PII)
GRANT SELECT ON public.user_sessions TO read_only;
GRANT SELECT ON public.learning_data TO read_only;

-- Leads (contains PII - consider excluding)
-- GRANT SELECT ON public.leads TO read_only;  -- COMMENTED: Contains email, name, phone

-- Inventory (if exists, non-PII)
-- GRANT SELECT ON public.inventory_items TO read_only;  -- Uncomment if table exists

-- Step 5: Create audit user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'bizionic_audit') THEN
        CREATE USER bizionic_audit WITH PASSWORD 'CHANGE_ME_GENERATE_STRONG_PASSWORD';
        COMMENT ON ROLE bizionic_audit IS 'Read-only audit user for Bizionic tech audit';
    END IF;
END
$$;

-- Step 6: Assign read-only role to audit user
GRANT read_only TO bizionic_audit;

-- Step 7: Set default privileges for future tables (optional)
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT ON TABLES TO read_only;

-- Step 8: Verify setup
SELECT 
    rolname,
    rolsuper,
    rolcanlogin,
    rolcreatedb,
    rolcreaterole
FROM pg_roles
WHERE rolname IN ('read_only', 'bizionic_audit');

-- Step 9: List granted tables
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'read_only'
ORDER BY table_schema, table_name;

-- IMPORTANT NOTES:
-- 1. Change the password 'CHANGE_ME_GENERATE_STRONG_PASSWORD' to a strong, unique password
-- 2. Rotate this password after the audit completes
-- 3. The audit user can only SELECT from non-PII tables
-- 4. PII tables (auth.users, profiles, user_platform_connections) are excluded
-- 5. Consider excluding deals and messenger_interactions if they contain PII

-- END OF SCRIPT

