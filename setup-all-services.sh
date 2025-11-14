#!/bin/bash

# Accorria - Unified Service Setup Script
# Configures Supabase, OpenAI, Gemini, and Google Cloud services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Accorria - Unified Service Setup${NC}"
echo "=========================================="
echo ""

# Function to check if command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 not found${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 found${NC}"
        return 0
    fi
}

# Check required CLI tools
echo -e "${BLUE}📋 Checking CLI tools...${NC}"
MISSING_TOOLS=0

check_command "supabase" || MISSING_TOOLS=$((MISSING_TOOLS + 1))
check_command "gcloud" || MISSING_TOOLS=$((MISSING_TOOLS + 1))
check_command "python3" || MISSING_TOOLS=$((MISSING_TOOLS + 1))

if [ $MISSING_TOOLS -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Some CLI tools are missing. Install them:${NC}"
    echo ""
    echo "Supabase CLI:"
    echo "  npm install -g supabase"
    echo "  or: brew install supabase/tap/supabase"
    echo ""
    echo "Google Cloud CLI:"
    echo "  curl https://sdk.cloud.google.com | bash"
    echo "  exec -l \$SHELL"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}🔧 Service Configuration${NC}"
echo "================================"
echo ""

# 1. SUPABASE SETUP
echo -e "${GREEN}1. Supabase Configuration${NC}"
echo "----------------------------"

if command -v supabase &> /dev/null; then
    echo "Checking Supabase CLI status..."
    if supabase status &> /dev/null; then
        echo -e "${GREEN}✓ Supabase project linked${NC}"
        SUPABASE_URL=$(supabase status --output json 2>/dev/null | grep -o '"API URL":"[^"]*' | cut -d'"' -f4 || echo "")
        if [ ! -z "$SUPABASE_URL" ]; then
            echo "  Project URL: $SUPABASE_URL"
        fi
    else
        echo -e "${YELLOW}⚠️  Supabase project not linked${NC}"
        echo "  Run: supabase link --project-ref YOUR_PROJECT_REF"
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI not installed${NC}"
fi

# Check for storage bucket
echo ""
echo "Checking for 'car-images' storage bucket..."
if command -v supabase &> /dev/null && supabase status &> /dev/null; then
    # Try to check bucket via API (would need to be implemented)
    echo -e "${GREEN}✓ Please verify 'car-images' bucket exists in Supabase Dashboard${NC}"
    echo "  Dashboard: https://supabase.com/dashboard/project/_/storage/buckets"
fi

echo ""

# 2. GOOGLE CLOUD SETUP
echo -e "${GREEN}2. Google Cloud Configuration${NC}"
echo "----------------------------"

if command -v gcloud &> /dev/null; then
    # Check authentication
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
        echo -e "${GREEN}✓ Authenticated as: $ACTIVE_ACCOUNT${NC}"
    else
        echo -e "${YELLOW}⚠️  Not authenticated${NC}"
        echo "  Run: gcloud auth login"
        echo "  Run: gcloud auth application-default login"
    fi
    
    # Check project
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
    if [ ! -z "$CURRENT_PROJECT" ]; then
        echo -e "${GREEN}✓ Current project: $CURRENT_PROJECT${NC}"
    else
        echo -e "${YELLOW}⚠️  No project set${NC}"
        echo "  Run: gcloud config set project YOUR_PROJECT_ID"
    fi
    
    # Check for Gemini API
    echo ""
    echo "Checking Gemini API access..."
    if [ ! -z "$CURRENT_PROJECT" ]; then
        if gcloud services list --enabled --filter="name:generativelanguage.googleapis.com" --format="value(name)" | grep -q generativelanguage; then
            echo -e "${GREEN}✓ Generative Language API enabled${NC}"
        else
            echo -e "${YELLOW}⚠️  Generative Language API not enabled${NC}"
            echo "  Run: gcloud services enable generativelanguage.googleapis.com"
        fi
    fi
    
    # Check for Vision API
    echo ""
    echo "Checking Vision API access..."
    if [ ! -z "$CURRENT_PROJECT" ]; then
        if gcloud services list --enabled --filter="name:vision.googleapis.com" --format="value(name)" | grep -q vision; then
            echo -e "${GREEN}✓ Vision API enabled${NC}"
        else
            echo -e "${YELLOW}⚠️  Vision API not enabled${NC}"
            echo "  Run: gcloud services enable vision.googleapis.com"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Google Cloud CLI not installed${NC}"
fi

echo ""

# 3. API KEYS CHECK
echo -e "${GREEN}3. API Keys Configuration${NC}"
echo "----------------------------"

# Check backend .env
BACKEND_ENV="backend/.env"
if [ -f "$BACKEND_ENV" ]; then
    echo -e "${GREEN}✓ Backend .env file found${NC}"
    
    # Check for API keys
    if grep -q "OPENAI_API_KEY=" "$BACKEND_ENV" && ! grep -q "OPENAI_API_KEY=$" "$BACKEND_ENV" && ! grep -q "OPENAI_API_KEY=sk-your" "$BACKEND_ENV"; then
        echo -e "${GREEN}  ✓ OpenAI API key configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  OpenAI API key not configured${NC}"
    fi
    
    if grep -q "GEMINI_API_KEY=" "$BACKEND_ENV" && ! grep -q "GEMINI_API_KEY=$" "$BACKEND_ENV" && ! grep -q "GEMINI_API_KEY=AIza-your" "$BACKEND_ENV"; then
        echo -e "${GREEN}  ✓ Gemini API key configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Gemini API key not configured${NC}"
    fi
    
    if grep -q "SUPABASE_URL=" "$BACKEND_ENV" && ! grep -q "SUPABASE_URL=$" "$BACKEND_ENV"; then
        echo -e "${GREEN}  ✓ Supabase URL configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Supabase URL not configured${NC}"
    fi
    
    if grep -q "SUPABASE_ANON_KEY=" "$BACKEND_ENV" && ! grep -q "SUPABASE_ANON_KEY=$" "$BACKEND_ENV"; then
        echo -e "${GREEN}  ✓ Supabase Anon Key configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Supabase Anon Key not configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Backend .env file not found${NC}"
    echo "  Create it from backend/env.example"
fi

# Check frontend .env.local
FRONTEND_ENV="frontend/.env.local"
if [ -f "$FRONTEND_ENV" ]; then
    echo -e "${GREEN}✓ Frontend .env.local file found${NC}"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=" "$FRONTEND_ENV" && ! grep -q "NEXT_PUBLIC_SUPABASE_URL=$" "$FRONTEND_ENV"; then
        echo -e "${GREEN}  ✓ Frontend Supabase URL configured${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Frontend Supabase URL not configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Frontend .env.local file not found${NC}"
    echo "  Create it from frontend/env.example"
fi

echo ""

# 4. QUICK ACTIONS
echo -e "${BLUE}🔧 Quick Actions${NC}"
echo "================"
echo ""
echo "1. Test Supabase connection"
echo "2. Test OpenAI API"
echo "3. Test Gemini API"
echo "4. Enable Google Cloud APIs"
echo "5. Create Supabase storage bucket"
echo "6. View all configuration"
echo "7. Exit"
echo ""
read -p "Select an action (1-7): " ACTION

case $ACTION in
    1)
        echo ""
        echo -e "${BLUE}Testing Supabase connection...${NC}"
        if [ -f "$BACKEND_ENV" ]; then
            source "$BACKEND_ENV"
            if [ ! -z "$SUPABASE_URL" ]; then
                echo "Testing connection to: $SUPABASE_URL"
                # You could add a curl test here
                echo -e "${GREEN}✓ Supabase URL configured${NC}"
            fi
        fi
        ;;
    2)
        echo ""
        echo -e "${BLUE}Testing OpenAI API...${NC}"
        if [ -f "$BACKEND_ENV" ]; then
            source "$BACKEND_ENV"
            if [ ! -z "$OPENAI_API_KEY" ]; then
                echo "Testing OpenAI API key..."
                # Test with a simple curl request
                RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
                    -H "Authorization: Bearer $OPENAI_API_KEY" \
                    https://api.openai.com/v1/models)
                if [ "$RESPONSE" = "200" ]; then
                    echo -e "${GREEN}✓ OpenAI API key is valid${NC}"
                else
                    echo -e "${RED}✗ OpenAI API key test failed (HTTP $RESPONSE)${NC}"
                fi
            else
                echo -e "${YELLOW}⚠️  OpenAI API key not found in .env${NC}"
            fi
        fi
        ;;
    3)
        echo ""
        echo -e "${BLUE}Testing Gemini API...${NC}"
        if [ -f "$BACKEND_ENV" ]; then
            source "$BACKEND_ENV"
            if [ ! -z "$GEMINI_API_KEY" ]; then
                echo "Testing Gemini API key..."
                # Test with a simple curl request
                RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
                    "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY")
                if [ "$RESPONSE" = "200" ]; then
                    echo -e "${GREEN}✓ Gemini API key is valid${NC}"
                else
                    echo -e "${RED}✗ Gemini API key test failed (HTTP $RESPONSE)${NC}"
                fi
            else
                echo -e "${YELLOW}⚠️  Gemini API key not found in .env${NC}"
            fi
        fi
        ;;
    4)
        echo ""
        echo -e "${BLUE}Enabling Google Cloud APIs...${NC}"
        if command -v gcloud &> /dev/null; then
            PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
            if [ ! -z "$PROJECT" ]; then
                echo "Enabling APIs for project: $PROJECT"
                gcloud services enable generativelanguage.googleapis.com
                gcloud services enable vision.googleapis.com
                gcloud services enable aiplatform.googleapis.com
                echo -e "${GREEN}✓ APIs enabled${NC}"
            else
                echo -e "${RED}✗ No Google Cloud project set${NC}"
            fi
        else
            echo -e "${RED}✗ Google Cloud CLI not installed${NC}"
        fi
        ;;
    5)
        echo ""
        echo -e "${BLUE}Creating Supabase storage bucket...${NC}"
        echo -e "${YELLOW}Note: This requires manual creation in Supabase Dashboard${NC}"
        echo "1. Go to: https://supabase.com/dashboard/project/_/storage/buckets"
        echo "2. Click 'New bucket'"
        echo "3. Name: car-images"
        echo "4. Enable 'Public bucket'"
        echo "5. Click 'Create'"
        ;;
    6)
        echo ""
        echo -e "${BLUE}Current Configuration:${NC}"
        echo "======================"
        if [ -f "$BACKEND_ENV" ]; then
            echo ""
            echo "Backend Environment:"
            grep -E "^(OPENAI_API_KEY|GEMINI_API_KEY|SUPABASE_URL|SUPABASE_ANON_KEY)=" "$BACKEND_ENV" | sed 's/=.*/=***HIDDEN***/'
        fi
        if [ -f "$FRONTEND_ENV" ]; then
            echo ""
            echo "Frontend Environment:"
            grep -E "^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY)=" "$FRONTEND_ENV" | sed 's/=.*/=***HIDDEN***/'
        fi
        if command -v gcloud &> /dev/null; then
            echo ""
            echo "Google Cloud:"
            echo "  Project: $(gcloud config get-value project 2>/dev/null || echo 'Not set')"
            echo "  Account: $(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1 || echo 'Not authenticated')"
        fi
        ;;
    7)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option"
        ;;
esac

echo ""
echo -e "${GREEN}✅ Setup check complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Ensure all API keys are configured in backend/.env"
echo "2. Ensure Supabase keys are in frontend/.env.local"
echo "3. Create 'car-images' bucket in Supabase Storage (public)"
echo "4. Enable Google Cloud APIs if using Gemini/Vision"
echo ""

