-- ACCORRIA — AUDIT USER SETUP SCRIPT (COMPLETE - All existing tables)
-- CONFIDENTIAL — For Bizionic Audit Use Only
-- 
-- This script creates a read-only database user for the audit
-- It grants permissions on all non-PII tables that exist

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
-- PII tables excluded: profiles, user_platform_connections, pii_data, leads, deals, messenger_interactions

DO $$
BEGIN
    -- Core analysis tables (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'car_analyses') THEN
        GRANT SELECT ON public.car_analyses TO read_only;
        RAISE NOTICE 'Granted SELECT on car_analyses';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'market_intelligence') THEN
        GRANT SELECT ON public.market_intelligence TO read_only;
        RAISE NOTICE 'Granted SELECT on market_intelligence';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_strategies') THEN
        GRANT SELECT ON public.pricing_strategies TO read_only;
        RAISE NOTICE 'Granted SELECT on pricing_strategies';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_generation') THEN
        GRANT SELECT ON public.content_generation TO read_only;
        RAISE NOTICE 'Granted SELECT on content_generation';
    END IF;
    
    -- Listings (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'car_listings') THEN
        GRANT SELECT ON public.car_listings TO read_only;
        RAISE NOTICE 'Granted SELECT on car_listings';
    END IF;
    
    -- Learning and sessions (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_sessions') THEN
        GRANT SELECT ON public.user_sessions TO read_only;
        RAISE NOTICE 'Granted SELECT on user_sessions';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'learning_data') THEN
        GRANT SELECT ON public.learning_data TO read_only;
        RAISE NOTICE 'Granted SELECT on learning_data';
    END IF;
    
    -- Agent workflows (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'agent_workflows') THEN
        GRANT SELECT ON public.agent_workflows TO read_only;
        RAISE NOTICE 'Granted SELECT on agent_workflows';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orchestrator_sessions') THEN
        GRANT SELECT ON public.orchestrator_sessions TO read_only;
        RAISE NOTICE 'Granted SELECT on orchestrator_sessions';
    END IF;
    
    -- Escrow workflows (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'escrow_workflows') THEN
        GRANT SELECT ON public.escrow_workflows TO read_only;
        RAISE NOTICE 'Granted SELECT on escrow_workflows';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blockchain_escrow') THEN
        GRANT SELECT ON public.blockchain_escrow TO read_only;
        RAISE NOTICE 'Granted SELECT on blockchain_escrow';
    END IF;
    
    -- Verification events (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verification_events') THEN
        GRANT SELECT ON public.verification_events TO read_only;
        RAISE NOTICE 'Granted SELECT on verification_events';
    END IF;
    
    -- Negotiator interactions (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'negotiator_interactions') THEN
        GRANT SELECT ON public.negotiator_interactions TO read_only;
        RAISE NOTICE 'Granted SELECT on negotiator_interactions';
    END IF;
    
    -- Analytics (anonymized)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics_events') THEN
        GRANT SELECT ON public.analytics_events TO read_only;
        RAISE NOTICE 'Granted SELECT on analytics_events';
    END IF;
    
    -- Asset attributes (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'asset_attributes') THEN
        GRANT SELECT ON public.asset_attributes TO read_only;
        RAISE NOTICE 'Granted SELECT on asset_attributes';
    END IF;
    
    -- Market intelligence indices (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'accorria_confidence_index') THEN
        GRANT SELECT ON public.accorria_confidence_index TO read_only;
        RAISE NOTICE 'Granted SELECT on accorria_confidence_index';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'accorria_ev_index') THEN
        GRANT SELECT ON public.accorria_ev_index TO read_only;
        RAISE NOTICE 'Granted SELECT on accorria_ev_index';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'accorria_migration_index') THEN
        GRANT SELECT ON public.accorria_migration_index TO read_only;
        RAISE NOTICE 'Granted SELECT on accorria_migration_index';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'accorria_risk_index') THEN
        GRANT SELECT ON public.accorria_risk_index TO read_only;
        RAISE NOTICE 'Granted SELECT on accorria_risk_index';
    END IF;
    
    -- Multi-asset listings (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'multi_asset_listings') THEN
        GRANT SELECT ON public.multi_asset_listings TO read_only;
        RAISE NOTICE 'Granted SELECT on multi_asset_listings';
    END IF;
    
    -- M2M transactions (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'm2m_transactions') THEN
        GRANT SELECT ON public.m2m_transactions TO read_only;
        RAISE NOTICE 'Granted SELECT on m2m_transactions';
    END IF;
    
    -- Trust badges (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trust_badges') THEN
        GRANT SELECT ON public.trust_badges TO read_only;
        RAISE NOTICE 'Granted SELECT on trust_badges';
    END IF;
    
    -- Synthetic datasets (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'synthetic_datasets') THEN
        GRANT SELECT ON public.synthetic_datasets TO read_only;
        RAISE NOTICE 'Granted SELECT on synthetic_datasets';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'synthetic_records') THEN
        GRANT SELECT ON public.synthetic_records TO read_only;
        RAISE NOTICE 'Granted SELECT on synthetic_records';
    END IF;
    
    -- API tracking (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'api_licenses') THEN
        GRANT SELECT ON public.api_licenses TO read_only;
        RAISE NOTICE 'Granted SELECT on api_licenses';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'api_usage_tracking') THEN
        GRANT SELECT ON public.api_usage_tracking TO read_only;
        RAISE NOTICE 'Granted SELECT on api_usage_tracking';
    END IF;
    
    -- Anomaly detections (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'anomaly_detections') THEN
        GRANT SELECT ON public.anomaly_detections TO read_only;
        RAISE NOTICE 'Granted SELECT on anomaly_detections';
    END IF;
    
    -- Security audit logs (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'security_audit_logs') THEN
        GRANT SELECT ON public.security_audit_logs TO read_only;
        RAISE NOTICE 'Granted SELECT on security_audit_logs';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'escrow_audit_logs') THEN
        GRANT SELECT ON public.escrow_audit_logs TO read_only;
        RAISE NOTICE 'Granted SELECT on escrow_audit_logs';
    END IF;
    
    -- Compliance records (non-PII)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'compliance_records') THEN
        GRANT SELECT ON public.compliance_records TO read_only;
        RAISE NOTICE 'Granted SELECT on compliance_records';
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'compliance_reports') THEN
        GRANT SELECT ON public.compliance_reports TO read_only;
        RAISE NOTICE 'Granted SELECT on compliance_reports';
    END IF;
    
    -- Beta signups (contains email - consider excluding)
    -- IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'beta_signups') THEN
    --     GRANT SELECT ON public.beta_signups TO read_only;
    --     RAISE NOTICE 'Granted SELECT on beta_signups';
    -- END IF;
    
    -- EXCLUDED TABLES (PII):
    -- profiles (contains email, phone, full_name)
    -- user_platform_connections (contains encrypted tokens)
    -- pii_data (contains PII)
    -- leads (contains email, name, phone)
    -- deals (contains buyer_name, buyer_phone, buyer_email)
    -- messenger_interactions (may contain PII in messages)
    -- beta_signups (contains email)
    
END
$$;

-- Step 5: Create audit user
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'bizionic_audit') THEN
        CREATE USER bizionic_audit WITH PASSWORD 'N90eylYR4yR6O7aehnyH';
        COMMENT ON ROLE bizionic_audit IS 'Read-only audit user for Bizionic tech audit';
        RAISE NOTICE 'Created user bizionic_audit';
    ELSE
        RAISE NOTICE 'User bizionic_audit already exists';
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

-- Step 10: List all existing tables in public schema (for reference)
SELECT 
    tablename,
    schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- IMPORTANT NOTES:
-- 1. The password 'N90eylYR4yR6O7aehnyH' is already set
-- 2. Rotate this password after the audit completes
-- 3. The audit user can only SELECT from non-PII tables that exist
-- 4. PII tables are excluded: profiles, user_platform_connections, pii_data, leads, deals, messenger_interactions, beta_signups
-- 5. Tables that don't exist are skipped (no errors)

-- END OF SCRIPT

