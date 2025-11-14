#!/bin/bash

# ACCORRIA — AUDIT USER SETUP VIA SUPABASE CLI
# CONFIDENTIAL — For Bizionic Audit Use Only

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

echo -e "${BLUE}Step 1: Creating Database Read-Only User${NC}"
echo ""

# Update AUDIT_SETUP.sql with password
sed "s/CHANGE_ME_GENERATE_STRONG_PASSWORD/$DB_PASSWORD/g" AUDIT_SETUP.sql > .audit_setup_temp.sql

# Execute SQL
echo -e "${YELLOW}Executing AUDIT_SETUP.sql...${NC}"
if supabase db execute --file .audit_setup_temp.sql 2>&1; then
    echo -e "${GREEN}✓ Database read-only user created${NC}"
else
    echo -e "${YELLOW}⚠ SQL execution may have failed. Check output above.${NC}"
    echo -e "${YELLOW}You can also run AUDIT_SETUP.sql manually in Supabase Dashboard${NC}"
fi

rm -f .audit_setup_temp.sql

echo ""
echo -e "${BLUE}Step 2: Demo User Setup${NC}"
echo ""
echo -e "${YELLOW}⚠ Demo user must be created manually in Supabase Dashboard${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}CREDENTIALS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Demo User (audit@accorria.com):${NC}"
echo "  Password: $DEMO_PASSWORD"
echo "  (Saved to: .audit_demo_password.txt)"
echo ""
echo -e "${GREEN}Database User (bizionic_audit):${NC}"
echo "  Password: $DB_PASSWORD"
echo "  (Saved to: .audit_db_password.txt)"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}NEXT STEPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Create demo user in Supabase Dashboard:"
echo "   - Go to: Authentication → Users → Add User"
echo "   - Email: audit@accorria.com"
echo "   - Password: $DEMO_PASSWORD"
echo "   - Auto Confirm: ✅ Yes"
echo ""
echo "2. Test access:"
echo "   - Log into Vercel UI with audit@accorria.com"
echo "   - Connect to Supabase as bizionic_audit user"
echo ""
echo -e "${YELLOW}⚠ Keep passwords secure!${NC}"
echo ""

