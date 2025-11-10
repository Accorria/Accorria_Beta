#!/bin/bash

# Setup Playwright and Facebook Session for fb_posting_bot.py
# This script installs Playwright, Chromium, and helps generate the session file

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Setting up Playwright for Facebook Marketplace Bot"
echo "=================================================="
echo ""

# Check if we're in the right directory
cd "$PROJECT_ROOT"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install Playwright
echo "📦 Installing Playwright..."
if ! pip show playwright > /dev/null 2>&1; then
    pip install playwright==1.40.0
    echo "✅ Playwright installed"
else
    echo "✅ Playwright already installed"
fi

# Install Chromium
echo "🌐 Installing Chromium browser..."
playwright install chromium
echo "✅ Chromium installed"

# Check if session file already exists
SESSION_FILE="$PROJECT_ROOT/fb_session.json"
if [ -f "$SESSION_FILE" ]; then
    echo ""
    echo "⚠️  Session file already exists: $SESSION_FILE"
    read -p "   Do you want to regenerate it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✅ Using existing session file"
        echo ""
        echo "🎉 Setup complete! You can now run:"
        echo "   python scripts/fb_posting_bot.py"
        exit 0
    fi
    echo "🔄 Regenerating session file..."
fi

# Generate session file
echo ""
echo "🔐 Generating Facebook session file..."
echo "=================================================="
echo ""
echo "📋 Instructions:"
echo "   1. A browser window will open"
echo "   2. Navigate to Facebook and log in manually"
echo "   3. After logging in, close the browser"
echo "   4. The session will be saved to: $SESSION_FILE"
echo ""
read -p "Press Enter to launch the browser for session capture..."

# Run playwright codegen to capture session
playwright codegen facebook.com --save-storage="$SESSION_FILE"

# Verify session file was created
if [ -f "$SESSION_FILE" ]; then
    echo ""
    echo "✅ Session file created successfully: $SESSION_FILE"
    echo ""
    echo "🎉 Setup complete! You can now run:"
    echo "   python scripts/fb_posting_bot.py"
else
    echo ""
    echo "❌ Session file was not created. Please try again."
    exit 1
fi

