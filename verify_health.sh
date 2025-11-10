#!/bin/bash

# ACCORRIA — HEALTH CHECK VERIFICATION SCRIPT
# CONFIDENTIAL — For Bizionic Audit Use Only
#
# This script verifies that all health endpoints are accessible
# Run this before the audit to ensure everything is working

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend URL
BACKEND_URL="${BACKEND_URL:-https://accorria-backend-tv2qihivdq-uc.a.run.app}"

echo "🔍 Verifying Accorria Health Endpoints..."
echo "Backend URL: $BACKEND_URL"
echo ""

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local description=$2
    local url="${BACKEND_URL}${endpoint}"
    
    echo -n "Checking $description... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" || echo -e "\n000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
        echo "  Response: $(echo "$body" | head -c 100)..."
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "  Response: $body"
        return 1
    fi
}

# Check health endpoint
check_endpoint "/health" "Health Check Endpoint"

echo ""

# Check root endpoint
check_endpoint "/" "Root Endpoint"

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Health Check Verification Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Exit with appropriate code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All endpoints are healthy${NC}"
    exit 0
else
    echo -e "${RED}✗ Some endpoints failed${NC}"
    exit 1
fi

