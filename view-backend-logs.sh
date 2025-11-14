#!/bin/bash
# Quick script to view backend logs

echo "🔍 Backend Log Viewer"
echo "===================="
echo ""
echo "Choose an option:"
echo "1. View last 50 lines"
echo "2. Follow logs in real-time (Ctrl+C to exit)"
echo "3. Search for 'VEHICLE DETECTION' entries"
echo "4. Search for 'Gemini detected' entries"
echo "5. View all recent logs"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
  1)
    echo "📋 Last 50 lines:"
    tail -50 /tmp/backend.log
    ;;
  2)
    echo "👀 Following logs (Ctrl+C to exit)..."
    tail -f /tmp/backend.log
    ;;
  3)
    echo "🔍 Searching for VEHICLE DETECTION:"
    grep -i "vehicle detection\|gemini detected\|using:" /tmp/backend.log | tail -20
    ;;
  4)
    echo "🔍 Searching for Gemini detection:"
    grep -i "gemini" /tmp/backend.log | tail -20
    ;;
  5)
    echo "📋 All recent logs:"
    tail -100 /tmp/backend.log
    ;;
  *)
    echo "Invalid choice. Showing last 50 lines:"
    tail -50 /tmp/backend.log
    ;;
esac

