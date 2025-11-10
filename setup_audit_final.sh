#!/bin/bash

# ACCORRIA — AUDIT USER SETUP VIA SUPABASE CLI
# CONFIDENTIAL — For Bizionic Audit Use Only
#
# This script prepares everything and gives you the SQL to run

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_REF="jchmewblysdlzibaaikl"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}ACCORRIA — AUDIT USER SETUP${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}✗ Supabase CLI not found${NC}"
    exit 1
fi

# Link to project
echo -e "${YELLOW}Linking to Accorria project...${NC}"
supabase link --project-ref "$PROJECT_REF" 2>/dev/null || echo "Already linked"
echo -e "${GREEN}✓ Project linked${NC}"
echo ""

# Generate passwords
DEMO_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-20)

# Save passwords
echo "$DEMO_PASSWORD" > .audit_demo_password.txt
echo "$DB_PASSWORD" > .audit_db_password.txt
chmod 600 .audit_demo_password.txt .audit_db_password.txt

echo -e "${GREEN}✓ Passwords generated and saved${NC}"
echo ""

# Create SQL file with password
sed "s/CHANGE_ME_GENERATE_STRONG_PASSWORD/$DB_PASSWORD/g" AUDIT_SETUP.sql > AUDIT_SETUP_READY.sql

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SETUP READY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✓ SQL file prepared: AUDIT_SETUP_READY.sql${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}CREDENTIALS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Demo User (audit@accorria.com):${NC}"
echo "  Email: audit@accorria.com"
echo "  Password: $DEMO_PASSWORD"
echo "  (Saved to: .audit_demo_password.txt)"
echo ""
echo -e "${GREEN}Database User (bizionic_audit):${NC}"
echo "  Username: bizionic_audit"
echo "  Password: $DB_PASSWORD"
echo "  (Saved to: .audit_db_password.txt)"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}NEXT STEPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Step 1: Run SQL in Supabase Dashboard${NC}"
echo "  1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo "  2. Open: AUDIT_SETUP_READY.sql"
echo "  3. Copy and paste the entire file"
echo "  4. Click 'Run'"
echo ""
echo -e "${YELLOW}Step 2: Create Demo User${NC}"
echo "  1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/auth/users"
echo "  2. Click 'Add User' → 'Create new user'"
echo "  3. Email: audit@accorria.com"
echo "  4. Password: $DEMO_PASSWORD"
echo "  5. Auto Confirm: ✅ Yes"
echo "  6. Click 'Create User'"
echo ""
echo -e "${YELLOW}Step 3: Test Access${NC}"
echo "  - Log into Vercel UI with audit@accorria.com"
echo "  - Connect to Supabase as bizionic_audit user"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✓ Setup complete! Follow the steps above.${NC}"
echo ""

