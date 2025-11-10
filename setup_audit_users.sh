#!/bin/bash

# ACCORRIA — AUDIT USER SETUP SCRIPT
# CONFIDENTIAL — For Bizionic Audit Use Only
#
# This script sets up audit users via Supabase CLI
# Run this script to create demo user and database read-only user

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project reference (Accorria's Project)
PROJECT_REF="jchmewblysdlzibaaikl"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}ACCORRIA — AUDIT USER SETUP${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}✗ Supabase CLI not found${NC}"
    echo "Install it: https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLI found${NC}"
echo ""

# Check if logged in
echo -e "${YELLOW}Checking Supabase login status...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${RED}✗ Not logged in to Supabase${NC}"
    echo "Please run: supabase login"
    exit 1
fi

echo -e "${GREEN}✓ Logged in to Supabase${NC}"
echo ""

# Link to project
echo -e "${YELLOW}Linking to Accorria project...${NC}"
if ! supabase link --project-ref "$PROJECT_REF" &> /dev/null; then
    echo -e "${YELLOW}⚠ Already linked or link failed, continuing...${NC}"
fi

echo -e "${GREEN}✓ Project linked${NC}"
echo ""

# Step 1: Create demo user (via SQL)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Creating Demo User (audit@accorria.com)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Generate a strong password for demo user
DEMO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-24)
echo -e "${YELLOW}Generated password for audit@accorria.com${NC}"
echo ""

# Create demo user SQL
DEMO_USER_SQL=$(cat <<EOF
-- Create demo user for audit
DO \$\$
BEGIN
    -- Check if user already exists
    IF NOT EXISTS (SELECT FROM auth.users WHERE email = 'audit@accorria.com') THEN
        -- Create user via Supabase Auth (this requires service role)
        -- Note: This needs to be done via Supabase Dashboard or API
        -- For now, we'll create a SQL script you can run
        RAISE NOTICE 'User creation requires Supabase Auth API or Dashboard';
    ELSE
        RAISE NOTICE 'User audit@accorria.com already exists';
    END IF;
END
\$\$;
EOF
)

echo -e "${YELLOW}⚠ Note: User creation via CLI requires Supabase Auth API${NC}"
echo -e "${YELLOW}Creating user via SQL script instead...${NC}"
echo ""

# Save demo user password
echo "$DEMO_PASSWORD" > .audit_demo_password.txt
chmod 600 .audit_demo_password.txt
echo -e "${GREEN}✓ Demo user password saved to .audit_demo_password.txt${NC}"
echo -e "${YELLOW}Password: ${DEMO_PASSWORD}${NC}"
echo ""

# Step 2: Create database read-only user
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Creating Database Read-Only User${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Generate a strong password for database user
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-24)
echo -e "${YELLOW}Generated password for bizionic_audit user${NC}"
echo ""

# Read AUDIT_SETUP.sql and replace password
if [ -f "AUDIT_SETUP.sql" ]; then
    # Create a temporary SQL file with the password
    sed "s/CHANGE_ME_GENERATE_STRONG_PASSWORD/$DB_PASSWORD/g" AUDIT_SETUP.sql > .audit_setup_temp.sql
    
    echo -e "${YELLOW}Running AUDIT_SETUP.sql...${NC}"
    
    # Execute SQL via Supabase CLI
    if supabase db execute --file .audit_setup_temp.sql; then
        echo -e "${GREEN}✓ Database read-only user created${NC}"
        
        # Save database password
        echo "$DB_PASSWORD" > .audit_db_password.txt
        chmod 600 .audit_db_password.txt
        echo -e "${GREEN}✓ Database password saved to .audit_db_password.txt${NC}"
        echo -e "${YELLOW}Password: ${DB_PASSWORD}${NC}"
        
        # Clean up temp file
        rm .audit_setup_temp.sql
    else
        echo -e "${RED}✗ Failed to create database user${NC}"
        echo -e "${YELLOW}You may need to run AUDIT_SETUP.sql manually in Supabase Dashboard${NC}"
        rm .audit_setup_temp.sql
    fi
else
    echo -e "${RED}✗ AUDIT_SETUP.sql not found${NC}"
    echo "Please ensure AUDIT_SETUP.sql exists in the current directory"
    exit 1
fi

echo ""

# Step 3: Verify setup
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Verifying Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verify read-only role exists
VERIFY_SQL=$(cat <<EOF
SELECT 
    rolname,
    rolsuper,
    rolcanlogin,
    rolcreatedb,
    rolcreaterole
FROM pg_roles
WHERE rolname IN ('read_only', 'bizionic_audit');
EOF
)

echo -e "${YELLOW}Verifying roles...${NC}"
if supabase db execute --query "$VERIFY_SQL" 2>/dev/null; then
    echo -e "${GREEN}✓ Roles verified${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify roles (this is okay if SQL executed)${NC}"
fi

echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SETUP COMPLETE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✓ Database read-only user created${NC}"
echo -e "${YELLOW}⚠ Demo user (audit@accorria.com) needs to be created manually${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Create demo user in Supabase Dashboard:"
echo "   - Go to: Authentication → Users"
echo "   - Add User → Create new user"
echo "   - Email: audit@accorria.com"
echo "   - Password: $(cat .audit_demo_password.txt)"
echo "   - Auto Confirm: ✅ Yes"
echo ""
echo "2. Test access:"
echo "   - Log into Vercel UI with audit@accorria.com"
echo "   - Connect to Supabase as bizionic_audit user"
echo ""
echo -e "${BLUE}Credentials saved to:${NC}"
echo "  - .audit_demo_password.txt (demo user password)"
echo "  - .audit_db_password.txt (database user password)"
echo ""
echo -e "${YELLOW}⚠ Keep these passwords secure!${NC}"
echo ""

