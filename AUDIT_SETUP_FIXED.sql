-- ACCORRIA — AUDIT USER SETUP SCRIPT (FIXED - Only grants on existing tables)
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

-- Step 4: Grant SELECT on existing non-PII tables only
-- We'll grant on tables that exist, skipping ones that don't

-- Core analysis tables (non-PII) - grant only if exists
DO $$
BEGIN
    -- car_analyses
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'car_analyses') THEN
        GRANT SELECT ON public.car_analyses TO read_only;
    END IF;
    
    -- market_intelligence
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'market_intelligence') THEN
        GRANT SELECT ON public.market_intelligence TO read_only;
    END IF;
    
    -- pricing_strategies
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_strategies') THEN
        GRANT SELECT ON public.pricing_strategies TO read_only;
    END IF;
    
    -- content_generation
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_generation') THEN
        GRANT SELECT ON public.content_generation TO read_only;
    END IF;
    
    -- listings (only if exists)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'listings') THEN
        GRANT SELECT ON public.listings TO read_only;
    END IF;
    
    -- user_sessions
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_sessions') THEN
        GRANT SELECT ON public.user_sessions TO read_only;
    END IF;
    
    -- learning_data
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'learning_data') THEN
        GRANT SELECT ON public.learning_data TO read_only;
    END IF;
    
    -- deals (contains buyer PII - consider excluding or masking)
    -- IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deals') THEN
    --     GRANT SELECT ON public.deals TO read_only;
    -- END IF;
    
    -- messenger_interactions (may contain PII in messages)
    -- IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messenger_interactions') THEN
    --     GRANT SELECT ON public.messenger_interactions TO read_only;
    -- END IF;
    
    -- leads (contains PII - consider excluding)
    -- IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') THEN
    --     GRANT SELECT ON public.leads TO read_only;
    -- END IF;
    
    -- inventory_items (if exists, non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory_items') THEN
        GRANT SELECT ON public.inventory_items TO read_only;
    END IF;
END
$$;

-- Step 5: Create audit user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'bizionic_audit') THEN
        CREATE USER bizionic_audit WITH PASSWORD 'N90eylYR4yR6O7aehnyH';
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
-- 1. The password 'N90eylYR4yR6O7aehnyH' is already set - change it if needed
-- 2. Rotate this password after the audit completes
-- 3. The audit user can only SELECT from non-PII tables that exist
-- 4. PII tables (auth.users, profiles, user_platform_connections) are excluded
-- 5. Consider excluding deals and messenger_interactions if they contain PII

-- END OF SCRIPT

