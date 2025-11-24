#!/bin/bash

# Accorria Mac Setup Script
# Run this from your Mac terminal: bash setup-mac.sh

set -e

echo "🍎 Setting up Accorria on Mac..."
echo ""

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first:"
    echo "   brew install node"
    echo "   Or download from: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python first:"
    echo "   brew install python@3.11"
    echo "   Or download from: https://www.python.org/downloads/"
    exit 1
else
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python found: $PYTHON_VERSION"
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first:"
    echo "   brew install git"
    exit 1
else
    GIT_VERSION=$(git --version)
    echo "✅ Git found: $GIT_VERSION"
fi

# Check Homebrew (optional but recommended)
if ! command -v brew &> /dev/null; then
    echo "⚠️  Homebrew not found (optional but recommended for Mac package management)"
    echo "   Install from: https://brew.sh"
else
    echo "✅ Homebrew found"
fi

echo ""
echo "📦 Step 1: Installing root npm dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Root node_modules installed"
else
    echo "✅ Root node_modules already exists"
    echo "   (Skipping installation - run 'npm install' manually if you need to update)"
fi

echo ""
echo "📦 Step 2: Installing frontend npm dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend node_modules installed"
else
    echo "✅ Frontend node_modules already exists"
    echo "   (Skipping installation - run 'npm install' manually if you need to update)"
fi
cd ..

echo ""
echo "🐍 Step 3: Setting up Python virtual environment..."
cd backend
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

echo "Activating virtual environment and installing dependencies..."
source .venv/bin/activate
pip install --upgrade pip --quiet
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies (this may take a few minutes)..."
    pip install -r requirements.txt
    echo "✅ Python dependencies installed"
    
    # Install Playwright browsers if playwright is installed
    if pip show playwright &> /dev/null; then
        echo ""
        echo "🎭 Installing Playwright browsers (for Facebook Marketplace automation)..."
        playwright install chromium
        echo "✅ Playwright browsers installed"
    fi
else
    echo "⚠️  requirements.txt not found"
fi
cd ..

echo ""
echo "📝 Step 4: Checking environment files..."

# Check backend .env
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        echo "⚠️  Backend .env not found. Creating from env.example..."
        cp backend/env.example backend/.env
        echo "✅ Created backend/.env - **PLEASE UPDATE WITH YOUR ACTUAL VALUES**"
        echo "   Required variables:"
        echo "   - SUPABASE_URL"
        echo "   - SUPABASE_ANON_KEY"
        echo "   - SUPABASE_SERVICE_ROLE_KEY"
        echo "   - OPENAI_API_KEY"
        echo "   - GEMINI_API_KEY"
        echo "   - SECRET_KEY"
        echo "   - JWT_SECRET_KEY"
    else
        echo "⚠️  Backend .env not found and no env.example available"
        echo "   Please create backend/.env manually with required variables"
    fi
else
    echo "✅ Backend .env exists"
fi

# Check frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    if [ -f "frontend/env.example" ]; then
        echo "⚠️  Frontend .env.local not found. Creating from env.example..."
        cp frontend/env.example frontend/.env.local
        echo "✅ Created frontend/.env.local - **PLEASE UPDATE WITH YOUR ACTUAL VALUES**"
    else
        echo "⚠️  Frontend .env.local not found and no env.example available"
        echo "   Please create frontend/.env.local manually with required variables"
    fi
else
    echo "✅ Frontend .env.local exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. ⚠️  IMPORTANT: Update environment variables:"
echo "   - Edit backend/.env with your API keys"
echo "   - Edit frontend/.env.local with your API keys"
echo ""
echo "   See backend/API_SETUP_GUIDE.md for where to get API keys"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "   Or start them separately:"
echo "   # Terminal 1 - Backend:"
echo "   cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "   # Terminal 2 - Frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API Docs: http://localhost:8000/docs"
echo ""
echo "📚 For more details, see:"
echo "   - backend/API_SETUP_GUIDE.md (API key setup)"
echo "   - SUPABASE_SETUP_GUIDE.md (Database setup)"
echo ""

