#!/bin/bash

# QuickFlip AI Backend Startup Script
# This script ensures the virtual environment is activated and dependencies are installed

echo "🚀 Starting QuickFlip AI Backend..."

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found. Please run this script from the backend directory."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "../.venv" ]; then
    echo "📦 Creating virtual environment..."
    cd ..
    python3 -m venv .venv
    cd backend
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source ../.venv/bin/activate

# Check if dependencies are installed
echo "📋 Checking dependencies..."
if ! python -c "import PIL" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
else
    echo "✅ Dependencies already installed"
fi

# Start the server
echo "🌐 Starting FastAPI server..."
echo "📍 Server will be available at: http://127.0.0.1:8000"
echo "📚 API docs will be available at: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 