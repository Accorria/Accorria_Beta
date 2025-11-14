#!/bin/bash

# Accorria WSL Setup Script
# Run this from your WSL terminal: bash setup-wsl.sh

set -e

echo "🚀 Setting up Accorria on WSL..."
echo ""

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "📦 Step 1: Installing root npm dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Root node_modules already exists"
fi

echo ""
echo "📦 Step 2: Installing frontend npm dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Frontend node_modules already exists"
fi
cd ..

echo ""
echo "🐍 Step 3: Setting up Python virtual environment..."
cd backend
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
fi

echo "Activating virtual environment and installing dependencies..."
source .venv/bin/activate
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "✅ Python dependencies installed"
else
    echo "⚠️  requirements.txt not found"
fi
cd ..

echo ""
echo "📝 Step 4: Checking environment files..."

# Check backend .env
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        echo "⚠️  Backend .env not found. Copying from env.example..."
        cp backend/env.example backend/.env
        echo "✅ Created backend/.env - Please update with your actual values"
    else
        echo "⚠️  Backend .env not found and no env.example available"
    fi
else
    echo "✅ Backend .env exists"
fi

# Check frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    if [ -f "frontend/env.example" ]; then
        echo "⚠️  Frontend .env.local not found. Copying from env.example..."
        cp frontend/env.example frontend/.env.local
        echo "✅ Created frontend/.env.local - Please update with your actual values"
    else
        echo "⚠️  Frontend .env.local not found and no env.example available"
    fi
else
    echo "✅ Frontend .env.local exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your API keys and database URL"
echo "2. Update frontend/.env.local with your Supabase and API keys"
echo "3. Run 'npm run dev' from the project root to start both servers"
echo ""
echo "To start the application, run:"
echo "  npm run dev"
echo ""
echo "Or start them separately:"
echo "  # Terminal 1 - Backend:"
echo "  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "  # Terminal 2 - Frontend:"
echo "  cd frontend && npm run dev"

