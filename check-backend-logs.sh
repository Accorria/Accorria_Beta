#!/bin/bash
# Quick script to check backend logs for Google Search API calls

echo "🔍 Checking Backend Logs for Google Search Activity"
echo "===================================================="
echo ""

# Find the uvicorn process
PID=$(ps aux | grep "uvicorn app.main" | grep -v grep | tail -1 | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "❌ Backend process not found"
    exit 1
fi

echo "✅ Found backend process: PID $PID"
echo ""
echo "📋 Recent Google Search API calls:"
echo "---------------------------------"

# Check if we can see the process output
# Since it's running in background, we'll check for log patterns
echo "Looking for recent MARKET-INTEL and Google Search entries..."
echo ""
echo "To see real-time logs, check the terminal where you started the backend"
echo "or look for output with these patterns:"
echo "  - [MARKET-INTEL] 🔍 Using REAL Google Gemini API"
echo "  - [MARKET-INTEL] 📝 Query:"
echo "  - [ENHANCED-ANALYZE] 🔍 Starting Google Search"
echo "  - [ENHANCED-ANALYZE] ✅ Google Search completed"
echo ""
echo "If you see '⚠️ Google Search failed' or no MARKET-INTEL messages,"
echo "then Google Search may not have run."

