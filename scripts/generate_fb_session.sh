#!/bin/bash

# Quick script to generate Facebook session file
# This will open a browser where you log into Facebook, then save your session

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SESSION_FILE="$PROJECT_ROOT/fb_session.json"

echo "🔐 Facebook Session Generator"
echo "=============================="
echo ""
echo "This will open a browser window where you can log into Facebook."
echo "After logging in, close the browser and your session will be saved."
echo ""
echo "Session will be saved to: $SESSION_FILE"
echo ""
read -p "Press Enter to start..."

# Run playwright codegen to capture session
playwright codegen facebook.com --save-storage="$SESSION_FILE"

# Verify session file was created
if [ -f "$SESSION_FILE" ]; then
    echo ""
    echo "✅ Session file created successfully!"
    echo "   Location: $SESSION_FILE"
    echo ""
    echo "🎉 You can now run the bot with:"
    echo "   python scripts/fb_posting_bot.py"
else
    echo ""
    echo "❌ Session file was not created. Please try again."
    exit 1
fi

