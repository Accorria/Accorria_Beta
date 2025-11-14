# Accorria WSL Setup Script for PowerShell
# This script runs WSL commands to set up the project

Write-Host "🚀 Setting up Accorria on WSL..." -ForegroundColor Cyan
Write-Host ""

$projectPath = "/home/eaton/code/accorria/Accorria_Beta/Accorria_Beta"

Write-Host "📦 Step 1: Installing root npm dependencies..." -ForegroundColor Yellow
wsl bash -c "cd $projectPath && npm install"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Root npm dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install root npm dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Step 2: Installing frontend npm dependencies..." -ForegroundColor Yellow
wsl bash -c "cd $projectPath/frontend && npm install"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend npm dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend npm dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🐍 Step 3: Setting up Python virtual environment..." -ForegroundColor Yellow
wsl bash -c "cd $projectPath/backend && if [ ! -d '.venv' ]; then python3 -m venv .venv; fi && source .venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python virtual environment set up" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set up Python virtual environment" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Step 4: Checking environment files..." -ForegroundColor Yellow
wsl bash -c "cd $projectPath && if [ ! -f backend/.env ]; then cp backend/env.example backend/.env && echo 'Created backend/.env'; fi && if [ ! -f frontend/.env.local ]; then cp frontend/env.example frontend/.env.local && echo 'Created frontend/.env.local'; fi"
Write-Host "✅ Environment files checked" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with your API keys and database URL"
Write-Host "2. Update frontend/.env.local with your Supabase and API keys"
Write-Host "3. To start the application, run in WSL:" -ForegroundColor Yellow
Write-Host "   cd ~/code/accorria/Accorria_Beta/Accorria_Beta"
Write-Host "   npm run dev"
Write-Host ""

