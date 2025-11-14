#!/bin/bash
# Check Supabase RLS Status using Management API

PROJECT_REF="jchmewblysdlzibaaikl"
ACCESS_TOKEN="sbp_3b528fe42fdbae36e6f381910fe492ca79e1c69f"

echo "🔍 Checking Supabase RLS Status for project: $PROJECT_REF"
echo ""

# Get database connection info
echo "📊 Getting database connection info..."
curl -s -X GET \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/pooler" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | jq '.' 2>/dev/null || echo "Could not get connection info"

echo ""
echo "✅ To see RLS policies, run the CHECK_RLS_STATUS.sql script in Supabase SQL Editor"
echo "   This will show you what's already configured without making any changes."

