-- ACCORRIA — AUDIT SETUP VERIFICATION
-- CONFIDENTIAL — For Bizionic Audit Use Only
--
-- This script verifies that the audit setup was successful

-- Step 1: Verify roles exist
SELECT 
    rolname,
    rolsuper,
    rolcanlogin,
    rolcreatedb,
    rolcreaterole
FROM pg_roles
WHERE rolname IN ('read_only', 'bizionic_audit')
ORDER BY rolname;

-- Step 2: Verify read_only role has grants on non-PII tables
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'read_only'
ORDER BY table_schema, table_name;

-- Step 3: Verify PII tables are NOT granted (should return 0 rows)
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'read_only'
AND table_name IN ('profiles', 'user_platform_connections', 'pii_data', 'leads', 'deals', 'messenger_interactions', 'beta_signups')
ORDER BY table_name;

-- Step 4: Count granted tables
SELECT 
    COUNT(DISTINCT table_name) as granted_tables_count
FROM information_schema.role_table_grants
WHERE grantee = 'read_only';

-- Step 5: List all tables in public schema (for reference)
SELECT 
    tablename,
    schemaname,
    CASE 
        WHEN tablename IN ('profiles', 'user_platform_connections', 'pii_data', 'leads', 'deals', 'messenger_interactions', 'beta_signups') 
        THEN 'EXCLUDED (PII)'
        ELSE 'INCLUDED (Non-PII)'
    END as audit_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY audit_status, tablename;

-- Step 6: Summary
SELECT 
    'Total tables in public schema' as metric,
    COUNT(*)::text as value
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Tables granted to read_only' as metric,
    COUNT(DISTINCT table_name)::text as value
FROM information_schema.role_table_grants
WHERE grantee = 'read_only'
UNION ALL
SELECT 
    'PII tables excluded' as metric,
    COUNT(*)::text as value
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_platform_connections', 'pii_data', 'leads', 'deals', 'messenger_interactions', 'beta_signups');

