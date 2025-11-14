# Accorria Setup Script - Run from PowerShell
# This script runs all setup commands through WSL

Write-Host "🚀 Setting up Accorria through WSL..." -ForegroundColor Cyan
Write-Host ""

$projectPath = "/home/eaton/code/accorria/Accorria_Beta/Accorria_Beta"

# Step 1: Install root npm dependencies
Write-Host "📦 Step 1/5: Installing root npm dependencies..." -ForegroundColor Yellow
wsl bash -c "cd $projectPath && npm install"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root npm dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root npm dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Install frontend npm dependencies
Write-Host "📦 Step 2/5: Installing frontend npm dependencies..." -ForegroundColor Yellow
wsl bash -c "cd $projectPath/frontend && npm install"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend npm dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend npm dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Set up Python virtual environment
Write-Host "🐍 Step 3/5: Setting up Python virtual environment..." -ForegroundColor Yellow
wsl bash -c "cd $projectPath/backend && if [ ! -d '.venv' ]; then python3 -m venv .venv; fi && source .venv/bin/activate && pip install --upgrade pip -q && pip install -r requirements.txt"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set up Python virtual environment" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python virtual environment set up" -ForegroundColor Green
Write-Host ""

# Step 4: Create environment files
Write-Host "📝 Step 4/5: Setting up environment files..." -ForegroundColor Yellow
wsl bash -c "cd $projectPath && if [ ! -f backend/.env ]; then cp backend/env.example backend/.env && echo 'Created backend/.env'; else echo 'backend/.env already exists'; fi && if [ ! -f frontend/.env.local ]; then cp frontend/env.example frontend/.env.local && echo 'Created frontend/.env.local'; else echo 'frontend/.env.local already exists'; fi"
Write-Host "✅ Environment files checked" -ForegroundColor Green
Write-Host ""

# Step 5: Summary
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/.env with your API keys and database URL"
Write-Host "2. Update frontend/.env.local with your Supabase and API keys"
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Yellow
Write-Host "   Option 1: Run in WSL terminal:" -ForegroundColor White
Write-Host "     wsl bash -c `"cd $projectPath && npm run dev`""
Write-Host ""
Write-Host "   Option 2: Open WSL terminal and run:" -ForegroundColor White
Write-Host "     cd ~/code/accorria/Accorria_Beta/Accorria_Beta"
Write-Host "     npm run dev"
Write-Host ""

